import {Router} from "express";
import {
    authenticationMiddleware
} from "../../Middleware/auth.middleware.js";
import { errorHandlerMiddleware } from "../../Middleware/error-handler.middleware.js";

import { addReactService, deleteReactService } from "./services/react.service.js";

const reactController = Router();

reactController.use(authenticationMiddleware());
reactController.post(
    "/create/:reactOnId",
    errorHandlerMiddleware(addReactService)
);

reactController.delete(
    "/delete/:reactId",
    errorHandlerMiddleware(deleteReactService)
);






export default reactController;
