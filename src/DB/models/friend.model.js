import mongoose from "mongoose";
const { Schema } = mongoose;
const friendsSchema = new Schema(
    {
        userId: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true
        },
        friends: [{
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true
        }]
    },
    {
        timestamps: true,
       
    }
);



export const Friends = mongoose.models.Friends || mongoose.model("Friends", friendsSchema);



