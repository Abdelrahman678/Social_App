import { authenticationMiddleware } from "../Middleware/auth.middleware.js";
import { sendMessageService } from "../Modules/User/services/chat.service.js";

export const socketConnection = new Map();

export const registerSocketId = async (handshake, id) => {
    /* get loggedIn User data */
      const accessToken = handshake.auth.accesstoken;
      /* verify token */
      const user = await authenticationMiddleware(accessToken);
      /* store socket id */
      socketConnection.set(user?._id?.toString(), id);
      console.log("socket Connected", user?._id?.toString()); 
      return 'Socket connected successfully';
}
export const removeSocketId = async (socket) => {
    
    return socket.on("disconnect", async () => {
        /* get loggedIn User data */
        const accessToken = socket?.handshake?.auth?.accesstoken;
        /* verify token */
        const user = await authenticationMiddleware(accessToken);
        socketConnection.delete(user?._id?.toString());
        console.log("socket Disconnected", user?._id?.toString());
        return 'Socket disconnected successfully';
    })
}
export const establishIoConnection = (io) => {
    return io.on("connection", async (socket) => {
        /* register socketId */
        await registerSocketId(socket.handshake, socket.id);
        console.log("socketConnection =>", socketConnection);
        await sendMessageService(socket);
        /* handle disconnection */
        await removeSocketId(socket);
        console.log("socketConnection =>", socketConnection);
    })
}    

