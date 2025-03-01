import {Router} from "express";
import { 
    confirmEmailService,
    gmailSignInService,
    gmailSignUpService,
    refreshTokenService,
    signInService,
    signOutService,
    signUpService,
    verifyEmailService
} from "./services/authentication.service.js";
import { errorHandlerMiddleware } from "../../Middleware/error-handler.middleware.js";


const authController = Router();


authController.post("/signup", errorHandlerMiddleware(signUpService));
authController.put("/confirm-email", errorHandlerMiddleware(confirmEmailService));
authController.post("/signin", errorHandlerMiddleware(signInService));
authController.post("/gmail-login", errorHandlerMiddleware(gmailSignInService));
authController.post("/gmail-signup", errorHandlerMiddleware(gmailSignUpService));
authController.get("/verify/:token", verifyEmailService);
authController.post("/refresh", refreshTokenService);
authController.post("/signout", signOutService);

export default authController;
