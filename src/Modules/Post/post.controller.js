import {Router} from "express";
import {
    authenticationMiddleware
} from "../../Middleware/auth.middleware.js";
import { errorHandlerMiddleware } from "../../Middleware/error-handler.middleware.js";
import { createPostService, getAllPostsService } from "./services/post.service.js";
import { MulterHost } from "../../Middleware/multer.middleware.js";
import { imageExtensions } from "../../Constants/constants.js";


const postController = Router({
    caseSensitive: true,
    strict: true
});

// postController.use(authenticationMiddleware());
postController.post(
    "/create",
    MulterHost(imageExtensions).array('images', 3),
    errorHandlerMiddleware(createPostService)
);

postController.get(
    "/get-all-posts",
    errorHandlerMiddleware(getAllPostsService)
);

export default postController;