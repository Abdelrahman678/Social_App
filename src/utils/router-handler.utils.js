import { globalErrorHandlerMiddleware } from "../Middleware/error-handler.middleware.js";
import authController from "../Modules/Auth/auth.controller.js";
import commentController from "../Modules/Comment/comment.controller.js";
import postController from "../Modules/Post/post.controller.js";
import reactController from "../Modules/React/react.controller.js";
import userController from "../Modules/User/user.controller.js";
import express from "express";
import { rateLimit } from "express-rate-limit";

const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, 
    limit:15, 
    message: {
        message: "Too many requests, please try again later"
    },
    legacyHeaders: false
})


const routerHandler = (app) => {
    /* apply limiter to all routes in the app */
    app.use(limiter);

    /* all other routes */
    // app.use("/", async (req, res) => {
    //     /* helmet test */
    //     // res.setHeader("Content-Type", "text/plain");
    //     return res.json({
    //         message: "Welcome to Social App"
    //     })
    // })
    app.use("/auth", authController);
    app.use("/user", userController);
    app.use("/post", postController);
    app.use("/comment", commentController);
    app.use("/react", reactController);
    app.get("/", (req, res) => {
        res.status(200).json({
            message: "Welcome to Social App"
        })
    })
    /* all static files */
    app.use("/Assets", express.static("Assets"));
    /* global error handler */
    app.use(globalErrorHandlerMiddleware);
    
}


export default routerHandler;