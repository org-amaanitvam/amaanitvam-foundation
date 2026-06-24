import mongoose from "mongoose";

const meetingSchema = new mongoose.Schema(
{
    title: {
        type: String,
        required: true
    },

    description: String,

    meetingDate: {
        type: Date,
        required: true
    },

    attendees: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "user"
        }
    ]
},
{
    timestamps: true
});

const meetingModel = mongoose.models.meeting || mongoose.model("meeting", meetingSchema);
export default meetingModel;