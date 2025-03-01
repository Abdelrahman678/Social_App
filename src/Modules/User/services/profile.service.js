import { compareSync, hashSync } from "bcrypt";
import BlackListTokens from "../../../DB/models/black-list.model.js";
import { User } from "../../../DB/models/user.model.js";
import { Decryption, Encryption } from "../../../utils/encryption.utils.js";
import jwt from "jsonwebtoken";
import { emailEventEmitter } from "../../../Services/send-email.service.js";
import { cloudinary } from "../../../Config/cloudinary.config.js";
import { nanoid } from "nanoid";
import { Requests } from "../../../DB/models/request.model.js";
import { Friends } from "../../../DB/models/friend.model.js";

export const uploadProfilePictureService = async (req, res) => {
    const {_id} = req.loggedInUser;
    const {file} = req;
    if(!file){
        return res.status(400).json({
            message: "No file uploaded"
        })
    }
    const url = `${req.protocol}://${req.headers.host}/${file.path}`;
    const user = await User.findByIdAndUpdate(_id, {profilePicture:url}, {new:true}); // new true returns the updated user if false is passed it returns the original user
    res.status(200).json({
        message: "Profile picture uploaded successfully",
        user
    })
}

export const uploadProfileCoversService = async (req, res) => {
    const {_id} = req.loggedInUser;
    const {files} = req;
    if(!files || !files.length){
        return res.status(400).json({
            message: "No file uploaded"
        })
    }
    const urls = files.map(file => {
        return {
            secure_url: `${req.protocol}://${req.headers.host}/${file.path}`
        };
    })
    const user = await User.findByIdAndUpdate(_id, {coverPictures:urls}, {new:true}); // new true returns the updated user if false is passed it returns the original user
    res.status(200).json({
        message: "Cover pictures uploaded successfully",
        user
    })
}

export const uploadProfilePictureCloudService = async (req, res) => {
    const {_id} = req.loggedInUser;
    const {file} = req;
    if(!file){
        return res.status(400).json({
            message: "No file uploaded"
        })
    }
    const folderId = nanoid(4);
    const {secure_url, public_id} = await cloudinary().uploader.upload(file.path,{
        folder:`${process.env.CLOUDINARY_FOLDER}/User/Profile/${folderId}`,
        // public_id:`${_id}` // you can change the public id to something else
        // resource_type:"auto" // the default value is "auto"
    })
    const user = await User.findByIdAndUpdate(_id, {profilePicture:{secure_url, public_id, folderId}}, {new:true}); // new true returns the updated user if false is passed it returns the original user
    res.status(200).json({
        message: "Profile picture uploaded successfully",
        user
    })
}

export const uploadProfileCoversCloudService = async (req, res) => {
    const {_id} = req.loggedInUser;
    const {files} = req;
    if(!files || !files.length){
        return res.status(400).json({
            message: "No file uploaded"
        })
    }
    // await inside loop the best way is to use For Of
    let urls = [];
    for(const file of files){
        const {secure_url, public_id} = await cloudinary().uploader.upload(file.path,{
            folder:`${process.env.CLOUDINARY_FOLDER}/User/Covers`,
        })
        urls.push({secure_url, public_id});
    }
    const user = await User.findByIdAndUpdate(_id, {coverPictures:urls}, {new:true}); // new true returns the updated user if false is passed it returns the original user

    res.status(200).json({
        message: "Cover pictures uploaded successfully",
        user
    })
} 

export const deleteAccountService = async (req, res) => {
    const {_id} = req.loggedInUser;
    const deletedUser = await User.findByIdAndDelete(_id);
    if(!deletedUser){
        return res.status(404).json({
            message: "User not found"
        })
    }
    // delete profile picture and cover pictures
    const profilePicture = deletedUser.profilePicture.public_id;
    const coverPictures = deletedUser.coverPictures.map(picture => picture.public_id);
    // delete one resource at by id
    if(profilePicture){
        const data = await cloudinary().uploader.destroy(profilePicture);
        const profileFolder = await cloudinary().api.delete_folder(`${process.env.CLOUDINARY_FOLDER}/User/Profile/${deletedUser.profilePicture.folderId}`);
    }
    if(coverPictures.length){
        const bulk = await cloudinary().api.delete_resources(coverPictures); 
        const coverFolder = await cloudinary().api.delete_folder(`${process.env.CLOUDINARY_FOLDER}/User/Covers`);  
    }
    return res.status(200).json({
        message: "Account deleted successfully"
    })
}

export const profileService = async (req, res) => {
    const {_id} = req.loggedInUser;
    const user = await User.findById(_id);
    if(!user){
        return res.status(404).json({
            message: "User not found"
        })
    }

    // decrypt phone number using hooks instead
    user.phone = await Decryption({ciphertext:user.phone,secretKey:process.env.ENCRYPTED_KEY});

    return res.status(200).json({
        message: "User found",
        user
    })
}

export const sendFriendRequestService = async (req, res) => {
    const {_id} = req.loggedInUser;
    const {requestToId} = req.params;
    /* check if user exists */
    const requestToUser = await User.findById(requestToId);
    if(!requestToUser){
        return res.status(404).json({
            message: "User not found"
        })
    }
    /* check if request already sent */
    let request = null;
    const requestExists = await Requests.findOne({requestedBy:_id});
    if(requestExists){
        const isRequestExists = requestExists.pendings.includes(requestToId);
        if(isRequestExists){
            return res.status(400).json({
                message: "Request already sent"
            })
        }
        requestExists.pendings.push(requestToId);
        request = await requestExists.save();
    }
    else{
        const newRequest = new Requests({
            requestedBy:_id,
            pendings:[requestToId]
        })
        request = await newRequest.save();
    }
    return res.status(200).json({
        message: "Friend Request sent successfully",
        request
    })
}

export const acceptFriendRequestService = async (req, res) => {
    const {_id} = req.loggedInUser;
    const {requestFromId} = req.params;
    
    const request = await Requests.findOneAndUpdate(
        {requestedBy:requestFromId, pendings:{$in:[_id]}},
        {$pull:{pendings:_id}}
    )
    if(!request){
        return res.status(404).json({
            message: "Request not found"
        })
    }
    
    let friend = null;
    const hasFriend = await Friends.findOne({userId:_id});
    if(hasFriend){
        const isFriendExists = hasFriend.friends.includes(requestFromId);
        if(isFriendExists){
            return res.status(400).json({
                message: "Friend already exists"
            })
        }
        hasFriend.friends.push(requestFromId);
        friend = await hasFriend.save();
    }
    else{ 
        const newFriend = new Friends({
            userId:_id,
            friends:[requestFromId]
        })
        friend = await newFriend.save();
    }
        // Update the requester's friend list
        const requesterFriend = await Friends.findOne({userId:requestFromId});
        if(requesterFriend){
            requesterFriend.friends.push(_id);
            await requesterFriend.save();
        } else {
            const newRequesterFriend = new Friends({
                userId:requestFromId,
                friends:[_id]
            });
            await newRequesterFriend.save();
        }
    return res.status(200).json({
        message: "Friend request accepted successfully",
        friend
    })
}

export const listFriendsService = async (req, res) => {
    const {_id,username} = req.loggedInUser;

    const friends = await Friends.findOne({userId:_id})
    .populate([
        {
            path: "friends",
            select: "username"
        }
    ]).select("friends -_id");
    // if(!friends){
    //     return res.status(404).json({
    //         message: "Friends not found"
    //     })
    // }
    return res.status(200).json({
        message: "Friends found",
        friends,
        user: { _id, username}
    })
}
// ---------------------------------------------------------------------------------

export const updatePasswordService = async (req, res) => {
    try{
        console.log({loggedInUser: req.loggedInUser});
        
        const {_id} = req.loggedInUser;
        const {oldPassword, newPassword, confirmPassword} = req.body;
        if(newPassword !== confirmPassword){
            return res.status(400).json({
                message: "Passwords do not match"
            })
        }
        const user = await User.findById(_id);
        if(!user){
            return res.status(404).json({
                message: "User not found"
            })
        }
        const isPasswordMatch = compareSync(oldPassword, user.password);
        if(!isPasswordMatch){
            return res.status(400).json({
                message: "Old password do not match"
            })
        }
        const hashedPassword = hashSync(newPassword, parseInt(process.env.SALT_ROUNDS));
        user.password = hashedPassword;
        await user.save();

        await BlackListTokens.create(req.loggedInUser.token);


        return res.status(200).json({
            message: "Password updated successfully"
        })

    }
    catch(error){
        console.log("error", error);
        return res.status(500).json({
            message: error.message,
        })  
    }
}

export const updateProfileService = async (req, res) => {
    try{
        const {_id} = req.loggedInUser;
        const {username, email, phone} = req.body;
        const user = await User.findById(_id);
        if(!user){
            return res.status(404).json({
                message: "User not found"
            })
        }

        if(username){
            user.username = username;
        }

        if(phone){
            user.phone = await Encryption({plaintext:phone,secretKey:process.env.ENCRYPTED_KEY});
        } 

        if(email){
            // check if email exists
            const isEmailExist = await User.findOne({email:email});
            if(isEmailExist){
                return res.status(409).json({
                    message: "Email already exist. Please try again."
                })
            }
            // send verification email
            const token = jwt.sign({email:email}, process.env.JWT_SECRET, {expiresIn:'1d'});
            const confirmEmailLink = `${req.protocol}://${req.headers.host}/auth/verify/${token}`;
            emailEventEmitter.emit("SendEmail",{
                to:email, 
                subject:"Verify your email",
                html:`<h1>Verify your email</h1>
                <p>Click on the link below to verify your email</p>
                <a href="${confirmEmailLink}">Verify Email</a>`
            })
            // update email
            user.email = email;
            user.isEmailVerified = false;
        }

        await user.save();
        return res.status(200).json({
            message: "Profile updated successfully"
        })
    }
    catch(error){
        console.log("error", error);
        return res.status(500).json({
            message: error.message,
        })  
    }
}

export const listUsersService = async (req, res) => {
        const users = await User.find({}, '-password -__v');
        return res.status(200).json({
            message: "Users found",
            users
        })
}



