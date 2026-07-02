import mongoose from "mongoose";

const contactSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            trim: true,
            maxlength: 120
        },
        email: {
            type: String,
            required: true,
            trim: true,
            lowercase: true,
            maxlength: 180
        },
        subject: {
            type: String,
            required: true,
            trim: true,
            maxlength: 180
        },
        message: {
            type: String,
            required: true,
            trim: true,
            maxlength: 5000
        },

        submissionTimestamp: {
            type: Date,
            default: Date.now,
            index: true
        }
    },
    {
        timestamps: true
    }
);

contactSchema.index({ submissionTimestamp: -1 });

const Contact = mongoose.model("Contact", contactSchema);

export default Contact;