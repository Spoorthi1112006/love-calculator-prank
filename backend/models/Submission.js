const mongoose = require('mongoose');

const SubmissionSchema = new mongoose.Schema({
    prankId: {
        type: String,
        required: true
    },
    phoneNumber: {
        type: String,
        required: true
    },
    victimName: {
        type: String,
        required: true
    },
    crushName: {
        type: String,
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Submission', SubmissionSchema);
