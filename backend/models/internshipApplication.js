import mongoose from "mongoose";

const internshipApplicationSchema = new mongoose.Schema(
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
        phone: {
            type: String,
            required: true,
            trim: true,
            maxlength: 20
        },
        track: {
            type: String,
            required: true,
            trim: true
        },
        university: {
            type: String,
            trim: true,
            maxlength: 200
        },
        currentYear: {
            type: String,
            trim: true,
            maxlength: 50
        },
        motivation: {
            type: String,
            required: true,
            trim: true,
            maxlength: 5000
        },
        portfolioUrl: {
            type: String,
            trim: true,
            maxlength: 500
        },

        duration: {
            type: String,
            trim: true,
            maxlength: 50
        },
        status: {
            type: String,
            enum: ["pending", "reviewing", "accepted", "rejected"],
            default: "pending",
            index: true
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

internshipApplicationSchema.index({ submissionTimestamp: -1 });

const InternshipApplication = mongoose.model("InternshipApplication", internshipApplicationSchema);

export default InternshipApplication;
