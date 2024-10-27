import { Request, Response } from "express";
import User from "../database/models/userModel";
import bcrypt from "bcrypt";
import generateToken from "../services/generateToken";
import generateOtp from "../services/generateOtp";
import sendMail from "../services/sendMail";

class UserController {
    static async register(req: Request, res: Response) {
        const { username, email, password } = req.body;

        if (!username || !email || !password) {
             res.status(400).json({
                message: "Please provide username, email, and password."
            });
            return
        }

        try {
            await User.create({
                username,
                email,
                password: bcrypt.hashSync(password, 10),
            });

            res.status(201).json({
                message: "User registered successfully."
            });
        } catch (error) {
            res.status(500).json({
                message: "Error registering user. Please try again."
            });
        }
    }

    static async login(req: Request, res: Response) {
        const { email, password } = req.body;

        if (!email || !password) {
            res.status(400).json({
                message: "Please provide email and password."
            });
            return
        }


        try {
            const user = await User.findOne({ where: { email } });

            if (!user) {
                res.status(404).json({
                    message: "No user found with that email."
                });
                return
            }

            const isEqual = bcrypt.compareSync(password, user.password);
            if (!isEqual) {
               res.status(401).json({
                    message: "Invalid password."
                });
                return
            }

            const token = generateToken(user.id);
            res.status(200).json({
                message: "Logged in successfully.",
                token
            });
        } catch (error) {
            res.status(500).json({
                message: "Error logging in. Please try again."
            });
        }
    }

    static async handleForgotPassword(req: Request, res: Response) {
        const { email } = req.body;

        if (!email) {
           res.status(400).json({
                message: "Please provide your email."
            });
            return
        }

        try {
            const user = await User.findOne({ where: { email } });

            if (!user) {
                res.status(404).json({
                    message: "Email not registered."
                });
                return
            }

            const otp = generateOtp();
            await sendMail({
                to: email,
                subject: "Password Change Request",
                text: `You requested a password reset. Here is your OTP: ${otp}`
            });

            res.status(200).json({
                message: "Password reset email sent."
            });
        } catch (error) {
            res.status(500).json({
                message: "Error sending email. Please try again."
            });
        }
    }
}

export default UserController;
