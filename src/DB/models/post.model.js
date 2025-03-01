import mongoose from "mongoose";
import mongoosePaginate from "mongoose-paginate-v2";
const { Schema } = mongoose;

const postSchema = new Schema(
    {
        title: {
            type: String,
            required: true
        },
        description: {
            type: String,
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
        allowedComments:{
            type: Boolean,
            default: true
        },
        images:{
            URLS:[{
                secure_url: String,
                public_id: String
            }],
            folderId: String
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
)

postSchema.plugin(mongoosePaginate)

/* comments virtual populate */
/* to get comments on post */
postSchema.virtual("Comments", {
    ref: "Comment",
    localField: "_id",
    foreignField: "commentOnId"
})

export const Post = mongoose.models.Post || mongoose.model("Post", postSchema);
