import {Router} from "express";
import {
    authenticationMiddleware
} from "../../Middleware/auth.middleware.js";
import { errorHandlerMiddleware } from "../../Middleware/error-handler.middleware.js";
import { MulterHost } from "../../Middleware/multer.middleware.js";
import { imageExtensions } from "../../Constants/constants.js";
import { checkTagMentionExistsMiddleware } from "../../Middleware/check-tag-mention.middleware.js";
import { addCommentService, getAllCommentsService } from "./services/comment.service.js";

const commentController = Router();

commentController.use(authenticationMiddleware());
commentController.post(
    "/create/:commentOnId",
    MulterHost(imageExtensions).array('images', 3),
    // must be after MulterHost
    checkTagMentionExistsMiddleware,
    errorHandlerMiddleware(addCommentService)
);
commentController.get(
    "/get-all-comments",
    errorHandlerMiddleware(getAllCommentsService)
);




export default commentController;
