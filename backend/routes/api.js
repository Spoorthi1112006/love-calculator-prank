const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const rateLimit = require('express-rate-limit');
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');

// Robust Twilio Import
let client;
try {
    const twilio = require('twilio');
    client = twilio(process.env.TWILIO_ACCOUNT_SID || 'AC_dummy', process.env.TWILIO_AUTH_TOKEN || 'dummy');
} catch (e) {
    console.warn("Twilio module missing or failed to load. Using mock client.");
    client = {
        messages: {
            create: async (msg) => console.log(`[MOCK SMS] To: ${msg.to}, Body: ${msg.body}`)
        }
    };
}

const Prank = require('../models/Prank');
const Submission = require('../models/Submission');
const OTP = require('../models/OTP');

// Rate Limiting
const otpLimiter = rateLimit({
    windowMs: 5 * 60 * 1000,
    max: 5,
    message: "Too many requests"
});

const handleValidationErrors = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
    next();
};

/* Routes */
router.post('/create-prank', [
    body('creatorName').trim().notEmpty().escape()
], async (req, res) => {
    try {
        const { creatorName } = req.body;
        const prankId = uuidv4();
        const newPrank = new Prank({ prankId, creatorName });
        await newPrank.save();
        res.json({ success: true, prankId });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false });
    }
});

router.post('/send-otp', otpLimiter, [
    body('phoneNumber').matches(/^\+?[1-9]\d{1,14}$/)
], async (req, res) => {
    const { phoneNumber } = req.body;
    try {
        const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
        const salt = await bcrypt.genSalt(10);
        const hashedOtp = await bcrypt.hash(otpCode, salt);

        await OTP.deleteMany({ phoneNumber });
        const newOTP = new OTP({ phoneNumber, otp: hashedOtp, expiresAt: new Date(Date.now() + 300000) });
        await newOTP.save();

        if (process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_ACCOUNT_SID !== 'AC_dummy_sid') {
            try {
                await client.messages.create({
                    body: `Your Love Calculator Code: ${otpCode}`,
                    from: process.env.TWILIO_PHONE_NUMBER,
                    to: phoneNumber
                });
            } catch (twilioErr) {
                console.error("Twilio Error:", twilioErr);
                // Don't fail the request, just log
            }
        } else {
            console.log(`[DEV MODE] OTP for ${phoneNumber}: ${otpCode}`);
        }
        res.json({ success: true });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false });
    }
});

router.post('/verify-otp', [
    body('phoneNumber').notEmpty(),
    body('otp').isLength({ min: 6 })
], async (req, res) => {
    const { phoneNumber, otp } = req.body;
    try {
        const record = await OTP.findOne({ phoneNumber });
        if (!record) return res.status(400).json({ success: false, message: "Invalid/Expired" });

        const isMatch = await bcrypt.compare(otp, record.otp);
        if (!isMatch) return res.status(400).json({ success: false });

        await OTP.deleteOne({ _id: record._id });
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ success: false });
    }
});

router.post('/submit', [
    body('prankId').notEmpty(),
    body('phoneNumber').notEmpty(),
    body('victimName').notEmpty(),
    body('crushName').notEmpty()
], async (req, res) => {
    const { prankId, phoneNumber, victimName, crushName } = req.body;
    try {
        const prank = await Prank.findOne({ prankId });
        if (!prank) return res.status(404).json({ success: false });

        const submission = new Submission({ prankId, phoneNumber, victimName, crushName });
        await submission.save();

        const lovePercentage = Math.floor(Math.random() * 100) + 1;

        // Try to send reveal SMS
        if (process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_ACCOUNT_SID !== 'AC_dummy_sid') {
            try {
                await client.messages.create({
                    body: `Pranked by ${prank.creatorName}! Result: ${lovePercentage}%`,
                    from: process.env.TWILIO_PHONE_NUMBER,
                    to: phoneNumber
                });
            } catch (e) {
                console.log("Failed to send reveal SMS");
            }
        }

        res.json({ success: true, lovePercentage, creatorName: prank.creatorName });
    } catch (err) {
        res.status(500).json({ success: false });
    }
});

router.get('/prank/:prankId', async (req, res) => {
    try {
        const prank = await Prank.findOne({ prankId: req.params.prankId });
        if (!prank) return res.status(404).json({ success: false });
        res.json({ success: true, creatorName: prank.creatorName });
    } catch (err) {
        res.status(500).json({ success: false });
    }
});

router.get('/dashboard/:prankId', async (req, res) => {
    try {
        const submissions = await Submission.find({ prankId: req.params.prankId }).sort({ createdAt: -1 });
        const prank = await Prank.findOne({ prankId: req.params.prankId });
        res.json({ success: true, prank, submissions });
    } catch (err) {
        res.status(500).json({ success: false });
    }
});

module.exports = router;
