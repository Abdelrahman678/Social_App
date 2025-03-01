import mongoose from "mongoose";
import { commentOnModelEnum } from "../../Constants/constants.js";
const { Schema } = mongoose;
const commentSchema = new Schema(
    {
        content: {
            type: String
        },
        ownerId: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true
        },
        tags: [{
            type: Schema.Types.ObjectId,
            ref: "User"
        }],
        images:{
            URLS:[{
                secure_url: String,
                public_id: String
            }],
            folderId: String
        },
        commentOnId:{
            type: Schema.Types.ObjectId,
            refPath: "onModel",
            required: true
        },
        onModel:{
            type: String,
            enum: Object.values(commentOnModelEnum),
        }
    },
    {
        timestamps: true,
        toJSON:{
            virtuals: true
        },
        toObject:{
            virtuals: true
        }
    }
);

/* To get comments on comment */
/* comments virtual populate */
commentSchema.virtual("Comments", {
    ref: "Comment",
    localField: "_id",
    foreignField: "commentOnId"
})

export const Comment = mongoose.models.Comment || mongoose.model("Comment", commentSchema);



