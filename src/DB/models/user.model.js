import mongoose from "mongoose";
import { genderEnum, providerEnum, systemRoles } from "../../Constants/constants.js";
import { hashSync } from "bcrypt";
import { Decryption, Encryption } from "../../utils/encryption.utils.js";
const {Schema} = mongoose;

const userSchema = new Schema(
    {
        username: {
            type: String,
            lowercase: true,
            trim: true,
            required: [true, "Username is required"],
            unique: [true, "Username already taken"],
        },
        email: {
            type: String,
            required: [true, "Email is required"],
            unique: [true, "Email already taken"],
        },
        password: {
            type: String,
            required: [true, "Password is required"],
        },
        phone: String,
        isDeactived:{
            type: Boolean,
            default: false
        },
        isVerified: {
            type: Boolean,
            default: false
        },

        //* if local *//
        // profilePicture: String,
        // coverPictures: [String],

        //* if cloudinary *//
        profilePicture: {
            secure_url: String,
            public_id: String,
            folderId: String
        },
        coverPictures: [{
            secure_url: String,
            public_id: String,
            folderId: String
        }],
        confirmOtp: String,
        forgotOtp: String,
        role: {
            type: String,
            default: systemRoles.USER,
            enum: Object.values(systemRoles)
        },
        isPublic: {
            type: Boolean,
            default: true
        },
        DOB: Date,
        gender: {
            type: String,
            enum: Object.values(genderEnum),
            default: genderEnum.NOT_SPECIFIED
        },
        provider: {
            type: String,
            enum: Object.values(providerEnum),
            default: providerEnum.SYSTEM
        }
    },
    {
        timestamps: true, 
    }
);

/* Hooks */
// =============== 1) Document Middleware =============== //
// this doesn't have access with arrow function () => {}
userSchema.pre("save", async function() {
    // console.log("Document Middleware this before => ", this);
    const changes = this.getChanges()['$set']
    // console.log(changes);
    if(changes.password){
        /* hash password */
        this.password = hashSync(this.password, parseInt(process.env.SALT_ROUNDS));
    }
    if(changes.phone){
        /*  Encrypt phone number */
        this.phone = await Encryption({plaintext:this.phone,secretKey:process.env.ENCRYPTED_KEY});
    }
});
userSchema.post("save", async function() {
    // console.log("Document Middleware this after => ", this);
});
userSchema.pre("updateOne", {document: true, query: false} ,async function() {
    // console.log("Document Middleware this before => ", this);
});
userSchema.pre("deleteOne", {document: true, query: false} ,async function() {
    // console.log("Document Middleware this before => ", this);
});
// =============== 2) Query Middleware =============== //
userSchema.post("findOne", async function(doc) {
    // console.log(this.getQuery()); // query
    // console.log(this.getUpdate()); // update
    // console.log(this.getOptions()); // options
    
    // decrypt phone number
    // doc.phone = await Decryption({ciphertext:doc.phone,secretKey:process.env.ENCRYPTED_KEY});
});

export const User = mongoose.models.User || mongoose.model("User", userSchema);