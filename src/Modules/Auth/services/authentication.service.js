import { compareSync, hashSync } from "bcrypt";
import { User } from "../../../DB/models/user.model.js";
import { Encryption } from "../../../utils/encryption.utils.js";
import { emailEventEmitter } from "../../../Services/send-email.service.js";
import jwt from "jsonwebtoken";
import { v4 as uuidv4 } from "uuid";
import BlackListTokens from "../../../DB/models/black-list.model.js";
import { generateToken } from "../../../utils/token.utils.js";
import { OAuth2Client } from "google-auth-library";
import { providerEnum } from "../../../Constants/constants.js";

export const signUpService = async (req, res, next) => {

        /* destructure request body */
        const {username, email, password, phone, gender, DOB, privateAccount} = req.body;
        /* check if email already exist */
        const isEmailExist = await User.findOne({email: email});
        if(isEmailExist){
            return res.status(409).json({message: "Email already exist. Please try again."});
        }
        
        //======== hash and encrypt using hooks instead ======
        // /* hash password */
        // const hashedPassword = hashSync(password, parseInt(process.env.SALT_ROUNDS));  
        // /*  Encrypt phone number */
        // const encryptedPhone = await Encryption({plaintext:phone,secretKey:process.env.ENCRYPTED_KEY});
       
        /* is public account */
        const isPublic = privateAccount ? false : true;
        /* generate otp */
        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        const hashedOtp = hashSync(otp, parseInt(process.env.SALT_ROUNDS));
        /* Send email */
        emailEventEmitter.emit("SendEmail", {
            subject: "Verify Your Email",
            html: `
            <div style="font-family: Arial, sans-serif; line-height: 1.5;">
                <h1 style="color: #4CAF50;">Verify Your Email</h1>
                <p>Hello,</p>
                <p>Thank you for registering with us. Your OTP for email verification is:</p>
                <p style="font-size: 24px; color: #FF5722;"><strong>${otp}</strong></p>
                <p>Please enter this OTP on the verification page to complete the process.</p>
                <p>If you did not sign up for this account, please ignore this email.</p>
                <p>Thank you!</p>
                <p>Best regards,<br>Your Company Name</p>
            </div>
            `,
            to: email
        });

        /** create user **/
        const user = new User({
            username:username,
            email:email,
            // password:hashedPassword,
            // phone:encryptedPhone,
            password:password,
            phone:phone,
            gender:gender,
            DOB:DOB,
            isPublic:isPublic,
            confirmOtp:hashedOtp
        })
        /* save user */
        await user.save();

        /* return response */
        if(!user){
            return res.status(500).json({message: "Something went wrong. Please try again later."});
        }
        return res.status(201).json({
            message: "User created successfully",
            data: user
        })
}

export const confirmEmailService = async (req, res) => {
        /* get email and confirm otp */
        const {email, confirmOtp} = req.body;
        /* check if user exists */
        const user = await User.findOne({email:email, isVerified:false, confirmOtp:{$exists:true}});
        /* return error if user not found */
        if(!user){
            return res.status(404).json({
                message: "User not found"
            })
        }
        /* check if otp is valid */
        const isOtpMatch = compareSync(confirmOtp, user.confirmOtp);
        /* return error if otp is not valid */
        if(!isOtpMatch){
            return res.status(400).json({
                message: "Invalid otp"
            })
        }
        /* update user */
        await User.findByIdAndUpdate(user._id, {isVerified:true, $unset:{confirmOtp:""}});
        /* return success response */
        return res.status(200).json({
            message: "Email Confirmed successfully",
        })
}

export const signInService = async (req, res) => {
        /* destructure request body */
        const {email, password} = req.body;
        /* find user by email */
        const user = await User.findOne({email:email});
        /* return error if user not found */
        if(!user){
            return res.status(404).json({message: "User not found"});
        }
        /* compare password */
        const isPasswordMatch = compareSync(password, user.password);
        if(!isPasswordMatch){
            return res.status(401).json({message: "Invalid credentials"});
        }
        /* generate tokens */
        const accessToken = generateToken({
            publicClaims:{_id:user._id},
            registeredClaims:{expiresIn:process.env.ACCESS_TOKEN_EXPIRATION_TIME, jwtid:uuidv4()},
            secretKey: process.env.JWT_SECRET_LOGIN
        })
        const refreshToken = generateToken({
            publicClaims:{_id:user._id},
            registeredClaims:{expiresIn:process.env.REFRESH_TOKEN_EXPIRATION_TIME, jwtid:uuidv4()},
            secretKey: process.env.JWT_SECRET_REFRESH
        })
        /* return success response */
        return res.status(200).json({
            message: "User logged in successfully",
            tokens:{
                accessToken,
                refreshToken
            }
        })
}

export const gmailSignUpService = async (req, res) => {
    /* destructure request body */
    const { idToken } = req.body;
    /* verify id token using google */
    const client = new OAuth2Client();
    const ticket = await client.verifyIdToken({
        idToken: idToken,
        audience: process.env.WEB_CLIENT_ID, 
    });
    const payload = ticket.getPayload();
    /* destructure payload from google */
    const { email_verified, name, email } = payload;
    /* return error if email is not verified */
    if(!email_verified){
        return res.status(401).json({
            message: "Invalid gmail credentials"
        })
    }
    /* check if user exists */
    const isEmailExist = await User.findOne({email:email});
    /* return error if user exists */
    if(isEmailExist){
        return res.status(409).json({
            message: "User already exists"
        })
    }
    /* create user */
    const user = new User({
        username:name,
        email:email,
        provider:providerEnum.GOOGLE,
        isVerified:true,
        password: hashSync(uuidv4(), parseInt(process.env.SALT_ROUNDS))
    })
    await user.save();
    /* return success response */
    return res.status(200).json({
        message: "User signed up successfully"
    })
}

export const gmailSignInService = async (req, res) => {
        /* destructure request body */
        const { idToken } = req.body;
        /* verify id token using google */
        const client = new OAuth2Client();
        const ticket = await client.verifyIdToken({
            idToken: idToken,
            audience: process.env.WEB_CLIENT_ID, 
        });
        const payload = ticket.getPayload();
        /* destructure payload from google */
        const {email, email_verified} = payload;
        /* return error if email is not verified */
        if(!email_verified){
            return res.status(401).json({
                message: "Invalid gmail credentials"
            })
        }
        /* check if the user exists in db and is google provider */
        const user = await User.findOne({email:email, provider:providerEnum.GOOGLE});
        /* return error if user not found */
        if(!user){
            return res.status(404).json({
                message: "User not found"
            })
        }
        /* generate tokens */
        const accessToken = generateToken({
            publicClaims:{_id:user._id},
            registeredClaims:{expiresIn:process.env.ACCESS_TOKEN_EXPIRATION_TIME, jwtid:uuidv4()},
            secretKey: process.env.JWT_SECRET_LOGIN
        })
        const refreshToken = generateToken({
            publicClaims:{_id:user._id},
            registeredClaims:{expiresIn:process.env.REFRESH_TOKEN_EXPIRATION_TIME, jwtid:uuidv4()},
            secretKey: process.env.JWT_SECRET_REFRESH
        })
        /* return success response */
        res.status(200).json({
            message: "User logged in successfully",
            tokens:{
                accessToken,
                refreshToken
            }
        })
}
    

export const refreshTokenService = async (req, res) => {
    try{    
        const {refreshtoken} = req.headers;
        const decoded = jwt.verify(refreshtoken, process.env.JWT_SECRET_REFRESH);
        const accessToken = jwt.sign({_id:decoded._id, email:decoded.email}, process.env.JWT_SECRET_LOGIN, {expiresIn:'1h'});
        return res.status(200).json({
            message: "Token refreshed successfully",
            accessToken
        })        
        
    }   
    catch(error){
        console.log("error", error);
        return res.status(500).json({
            message: error,
        })  
    }
}

export const signOutService = async (req, res) => {
    try{
        const {accesstoken, refreshtoken} = req.headers;
        const decoded = jwt.verify(accesstoken, process.env.JWT_SECRET_LOGIN);
        const decodedRefreshToken = jwt.verify(refreshtoken, process.env.JWT_SECRET_REFRESH);
    
        await BlackListTokens.insertMany(
        [
            {tokenId:decoded.jti, expiryDate:decoded.exp},
            {tokenId:decodedRefreshToken.jti, expiryDate:decodedRefreshToken.exp}
        ]
    );
        return res.status(200).json({
            message: "User logged out successfully",
        })
    }
    catch(error){
        console.log("error", error);
        return res.status(500).json({
            message: error,
        })  
    }
}

export const verifyEmailService = async (req, res) => {
    try{
        const {token} = req.params;
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const {email} = decoded;
        const user = await User.findOneAndUpdate({email:email}, {isEmailVerified:true}, {new:true});
        if(!user){
            return res.status(404).json({
                message: "User not found"
            })
        }
        return res.status(200).json({
            message: "Email verified successfully",
            data: user
        })
    }
    catch(error){
        console.log("error", error);
        return res.status(500).json({
            message: error,
        })  
    }
}
