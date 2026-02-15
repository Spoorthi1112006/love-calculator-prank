const mongoose = require('mongoose');

const OTPSchema = new mongoose.Schema({
    phoneNumber: {
        type: String,
        required: true,
        unique: true // Ensure one active OTP per phone number at a time
    },
    otp: {
        type: String, // Hashed OTP
        required: true
    },
    expiresAt: {
        type: Date,
        required: true,
        index: { expires: 0 } // Create TTL index
    }
});

module.exports = mongoose.model('OTP', OTPSchema);
