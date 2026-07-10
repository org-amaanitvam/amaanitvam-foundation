import mongoose from "mongoose";

const volunteerApplicationSchema = new mongoose.Schema(
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
        role: {
            type: String,
            required: true,
            trim: true
        },
        availability: {
            type: String,
            required: true,
            trim: true,
            maxlength: 100
        },
        skills: {
            type: String,
            trim: true,
            maxlength: 1000
        },
        motivation: {
            type: String,
            required: true,
            trim: true,
            maxlength: 5000
        },
        resumeUrl: {
            type: String,
            default: ""
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

volunteerApplicationSchema.index({ submissionTimestamp: -1 });

const VolunteerApplication = mongoose.model("VolunteerApplication", volunteerApplicationSchema);

export default VolunteerApplication;