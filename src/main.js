import express from "express";
import {db_connection} from "./DB/connection.js";
import routerHandler from "./utils/router-handler.utils.js";
import { config } from "dotenv";
import path from "path";
import cors from "cors";
import  helmet  from "helmet"; 
import {Server } from "socket.io";
import { authenticationMiddleware } from "./Middleware/auth.middleware.js";
import { establishIoConnection } from "./utils/socket.utils.js";
// config .env file
config({path: path.resolve(`.env`)});
// config({path:path.resolve(`src/config/.${process.env.NODE_ENV}.env`)});

const whitelist = [process.env.FRONTEND_CORS_ORIGIN, undefined, process.env.SOCKET_IO_CORS_ORIGIN];

/* not working with postman as origin is undefined 
--- so we have to add undefined to whitelist temporarily ---
--- remove after testing ---
*/
const corsOptions = {
  origin: function (origin, callback) {
    if (whitelist.indexOf(origin) !== -1) {
      callback(null, true)
    } else {
      callback(new Error('Not allowed by CORS'))
    }
  }
}

/* working but not safe */
// const corsOptions = {
//     origin: function (origin, callback) {
//         // Allow requests without an Origin header
//         if (!origin || whitelist.indexOf(origin) !== -1) {
//             callback(null, true);
//         } else {
//             callback(new Error('Not allowed by CORS'));
//         }
//     }
// };

/* also for socket io that is now in util file */
// const socketConnection = new Map()

async function bootStrap() {

    // express app
    const app = express();
    app.use(express.json());
    // cors
    app.use(cors(corsOptions));
    // helmet
    app.use(helmet()); 
    // routerHandler
    routerHandler(app);
    // db connection
    db_connection();

    const server = app.listen(process.env.PORT, () => {
        console.log(`Server Started on port ${process.env.PORT}`);
    })
    const io = new Server(server,{
      cors: {
        origin: process.env.SOCKET_IO_CORS_ORIGIN
      }
    });

    /* socket io connection */
    establishIoConnection(io);
    /* before using util file */
    // io.on("connection", async (socket) => {
    //   // console.log("Socket connected", socket.id);
    //   // console.log(socket.handshake);
    //   // socket.on("sendMessage", (data) => {
    //   //   // console.log(data);
    //   //   // socket.emit("resMessage", "hello from backend");
    //   //   // io.emit("resMessage", "hello back from backend to all connected clients");
    //   //   // socket.broadcast.emit("resMessage", "hello back from backend to all connected clients except sender");
    //   //   // socket.join("room 1");
    //   //   /* socket.to will broadcast to all rooms except room 1 */
    //   //   // socket.to("room 1").emit("resMessage", "hello back from backend to all rooms except room 1");
    //   //   // io.to("room 1").emit("resMessage", "hello back from backend to all connected clients in room 1");
    //   //   // io.except("room 1").emit("resMessage", "hello back from backend to all except connected clients in room 1");
    //   // })

    //   const accessToken = socket.handshake.auth.accesstoken;
    //   const user = await authenticationMiddleware(accessToken);
    //   console.log("socketConnection", socketConnection);
    //   socketConnection.set(user?._id?.toString(), socket.id);
    //   console.log("socketConnection", socketConnection);      
    // });
     
} 

export default bootStrap;  