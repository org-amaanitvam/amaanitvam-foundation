import mongoose from "mongoose";

const taskSchema = new mongoose.Schema(
{
    title: {
        type: String,
        required: true
    },

    description: String,

    assignedTo: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "user"
    },

    status: {
        type: String,
        enum: ["open", "inProgress", "completed"],
        default: "open"
    },

    deadline:{
        type:Date,
    } 
},
{
    timestamps: true
});

const taskModel = mongoose.models.task || mongoose.model("task", taskSchema);
export default taskModel;
