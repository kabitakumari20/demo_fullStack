const mongoose = require("mongoose");

const FAQschema = new mongoose.Schema({
    question: { type: String },
    answer: { type: String },
    subject: { type: String },
    status: {
        type: String,
        enum: ['Pending', 'Answered'],
        default: 'Pending'
    },
    userId: {
        type: Number,
        ref: 'User'
    },
    isExpanded: {
        type: Boolean,
        default: false
    }
},
    {
        timestamps: true,
        versionKey: false
    });
const FAQ = mongoose.model("FAQ", FAQschema);
module.exports = { FAQ };
