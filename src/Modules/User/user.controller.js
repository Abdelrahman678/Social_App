import {Router} from "express";
import {
    acceptFriendRequestService,
    deleteAccountService,
    listFriendsService,
    listUsersService,
    profileService,
    sendFriendRequestService,
    updatePasswordService,
    updateProfileService,
    uploadProfileCoversCloudService,
    uploadProfileCoversService,
    uploadProfilePictureCloudService,
    uploadProfilePictureService
} from "./services/profile.service.js";
import {
    authenticationMiddleware,
    authorizationMiddleware
} from "../../Middleware/auth.middleware.js";
import { imageExtensions, systemRoles } from "../../Constants/constants.js";
import asyncHandler from "express-async-handler";
import { errorHandlerMiddleware } from "../../Middleware/error-handler.middleware.js";
import { MulterHost, MulterLocal } from "../../Middleware/multer.middleware.js";
import { getChatHistoryService } from "./services/chat.service.js";

const userController = Router();

userController.use(authenticationMiddleware());
userController.patch(
    "/upload-profile-picture",
    MulterLocal(`User/Profile`, imageExtensions).single('image'),
    errorHandlerMiddleware(uploadProfilePictureService)  
);
userController.patch(
    "/upload-cover-pictures",
    MulterLocal(`User/Covers`, imageExtensions).array('covers',3),    
    errorHandlerMiddleware(uploadProfileCoversService)  
);
userController.patch(
    "/upload-profile-picture-cloud",
    MulterHost(imageExtensions).single('image'),
    errorHandlerMiddleware(uploadProfilePictureCloudService)  
);
userController.patch(
    "/upload-cover-pictures-cloud",
    MulterHost(imageExtensions).array('covers',3),    
    errorHandlerMiddleware(uploadProfileCoversCloudService)  
);
userController.delete(
    "/delete-account",
    errorHandlerMiddleware(deleteAccountService)  
);
userController.get(
    "/profile" ,
    errorHandlerMiddleware(profileService)
);

userController.post(
    "/send-friend-request/:requestToId",
    errorHandlerMiddleware(sendFriendRequestService)
);
userController.patch(
    "/accept-friend-request/:requestFromId",
    errorHandlerMiddleware(acceptFriendRequestService)
);
userController.get(
    "/list-friends",
    errorHandlerMiddleware(listFriendsService)
)
userController.get(
    "/get-chat-history/:receiverId",
    errorHandlerMiddleware(getChatHistoryService)
)





// use .use() to apply middleware to all routes in the router 'it runs before every route in this router'
// userController.get("/profile", authorizationMiddleware([systemRoles.USER]) ,profileService);
userController.patch("/update-password", updatePasswordService);
userController.put("/update-profile", updateProfileService);
userController.get("/list-friends", authorizationMiddleware([systemRoles.ADMIN]), errorHandlerMiddleware(listUsersService));

export default userController;

// ---------------------------------------------------------------------------------
/* for me 
.single => only one file can be uploaded => req.file
.array => multiple files can be uploaded same field name => req.files
.fields => 

MulterLocal(`User/Profile`, imageExtensions).single('image'),    
MulterLocal(`User/Profile`, imageExtensions).array('image',3),
MulterLocal(`User/Profile`, imageExtensions).fields(
    [
    {name:'image',maxCount:3},
    {name:'video',maxCount:1}
    ]
),
*/