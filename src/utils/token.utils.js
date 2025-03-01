import jwt from "jsonwebtoken";

export const generateToken = ({
    publicClaims,
    registeredClaims,
    secretKey
}) => {
    // console.log("secretKey", secretKey);
    return jwt.sign(publicClaims, secretKey, registeredClaims);
} 

export const verifyToken = ({
    token,
    secretKey
}) => {
    return jwt.verify(token, secretKey);
}