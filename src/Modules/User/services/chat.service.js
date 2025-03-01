import { Socket } from "socket.io";
import { Chat } from "../../../DB/models/chat.model.js";
import { authenticationMiddleware } from "../../../Middleware/auth.middleware.js";
import { socketConnection } from "../../../utils/socket.utils.js";

export const getChatHistoryService = async (req, res) => {
    const { _id } = req.loggedInUser;
    const { receiverId } = req.params; 

    const chat = await Chat.findOne({
        $or:[
            {senderId:_id,receiverId},
            {receiverId:_id,senderId:receiverId}
        ]
    }).populate([
        {
            path: "senderId",
            select: "username profilePicture"
        },
        {
            path: "receiverId",
            select: "username profilePicture"
        },
        {
            path: "messages.senderId",
            select: "username profilePicture"
        }
    ])
    // if(!chat){
    //     return res.status(404).json({
    //         message: "Chat not found"
    //     })
    // }
    
    return res.status(200).json({
        message: "Chat history found successfully",
        chat
    }) 
    
}

export const sendMessageService = async (socket) => {

    return socket.on("sendMessage", async (message) => {
        const loggedInUser = await authenticationMiddleware(socket.handshake.auth.accesstoken);
        const { body, receiverId } = message;
        let chat = await Chat.findOneAndUpdate(
            {
                $or:[
                    {senderId:loggedInUser._id,receiverId},
                    {receiverId:loggedInUser._id,senderId:receiverId}
                ]
            },
            {
                $addToSet:{
                    messages:{
                        body,
                        senderId:loggedInUser._id
                    }
                }
            }
        )

        if(!chat){
            chat = new Chat({
                senderId:loggedInUser._id,
                receiverId,
                messages:[{
                    body,
                    senderId:loggedInUser._id
                }]
            })
            await chat.save();
        }
        socket.emit("successMessage",
            {
                body,
                chat
            }
        )
        const receiverSocket = socketConnection.get(receiverId.toString());
        console.log("receiverSocket",receiverSocket);
        socket.to(receiverSocket).emit("receiveMessage",{body})
    })
    
}