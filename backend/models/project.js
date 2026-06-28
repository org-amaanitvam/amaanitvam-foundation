import mongoose from "mongoose";

const projectSchema = new mongoose.Schema(
{
    title: {
        type: String,
        required: true
    },

    description: String,

    startDate: {
        type: Date
    },

    endDate: {
        type: Date
    },

    progress: {
        type: Number,
        default: 0,
        min: 0,
        max: 100
    },

    status: {
        type: String,
        enum: ["ongoing", "completed", "pending_approval"],
        default: "ongoing"
    },
    
    assignedMembers: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    }]
},
{
    timestamps: true
});

const projectModel = mongoose.models.project || mongoose.model("project", projectSchema);
export default projectModel;