import mongoose from "mongoose";
import { commentOnModelEnum, reactTypeEnum } from "../../Constants/constants.js";

const {Schema} = mongoose;

const reactSchema = new Schema(
    {
        reactOnId: {
            type: Schema.Types.ObjectId,
            refPath: "onModel",
            required: true
        },
        onModel: {
            type: String,
            enum: Object.values(commentOnModelEnum)
        },
        ownerId: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true
        },
        reactType: {
            type: String,
            enum: Object.values(reactTypeEnum)
        },
        
    },
    {
        timestamps: true
    }
)

export const React = mongoose.models.React || mongoose.model("React", reactSchema);