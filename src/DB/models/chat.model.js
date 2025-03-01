import mongoose from "mongoose";
const { Schema } = mongoose;
const chatSchema = new Schema(
    {
        senderId: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true
        },
        receiverId: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true
        },
        messages: [{
            body:{ type: String, required: true },
            senderId: { type: Schema.Types.ObjectId, ref: "User", required: true },
            sentAt: { type: Date, default: Date.now }
        }]
    },
    {
        timestamps: true
    }
)

export const Chat = mongoose.models.Chat || mongoose.model("Chat", chatSchema);