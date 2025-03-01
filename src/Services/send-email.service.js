import nodemailer from "nodemailer";
import { EventEmitter } from "node:events";

export const sendEmailService = async ({
    to,
    subject,
    html,
}) => {
    try{
        const transporter = nodemailer.createTransport({
            host: "smtp.gmail.com",
            port: 465,
            secure: true, // true for 465, false for other ports
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS, 
            },
            // tls: {
            //     rejectUnauthorized: false
            // }
        })

        const info = await transporter.sendMail({
            from: `"NO-REPLY" <${process.env.EMAIL_USER}>`,
            to,
            subject,
            html,
        })
        return info
    }
    catch(error){   
        console.log("error", error);
        return error
    }

}

export const emailEventEmitter = new EventEmitter();
emailEventEmitter.on("SendEmail", async ({to,subject,html}) => {
    await sendEmailService({to,subject,html});
})