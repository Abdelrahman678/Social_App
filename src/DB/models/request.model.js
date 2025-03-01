import mongoose from "mongoose";
const { Schema } = mongoose;
const requestsSchema = new Schema(
    {
        requestedBy: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true
        },
        pendings: [{
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true
        }]
    },
    {
        timestamps: true,
       
    }
);



export const Requests = mongoose.models.Requests || mongoose.model("Requests", requestsSchema);



