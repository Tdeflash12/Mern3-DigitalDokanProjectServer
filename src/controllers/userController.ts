import { Request, Response } from "express"; // Importing types from Express for better type safety in TypeScript
import User from "../database/models/userModel"; // Importing the User model, which interacts with the database
import bcrypt from "bcrypt"; // Importing bcrypt for hashing passwords securely
import generateToken from "../services/generateToken"; // Importing a service for generating JWT tokens for user authentication
import generateOtp from "../services/generateOtp"; // Importing a service for generating OTPs (One-Time Passwords) for password reset
import sendMail from "../services/sendMail"; // Importing a service for sending emails

/**
 * UserController is responsible for handling user-related operations,
 * such as registering a new user, logging in, and managing password resets.
 */
class UserController {
    /**
     * Registers a new user.
     * 
     * @param req - The HTTP request object containing user details in the body.
     * @param res - The HTTP response object used to send responses back to the client.
     */
    static async register(req: Request, res: Response) {
        // Extract username, email, and password from the request body
        const { username, email, password } = req.body;

        // Input validation: Check if all required fields are provided
        if (!username || !email || !password) {
           res.status(400).json({
                message: "Please provide username, email, and password." // Inform the client of missing fields
            });
            return 
        }

        try {
            // Hash the password asynchronously to ensure it is securely stored
            const hashedPassword = await bcrypt.hash(password, 10); // 10 is the number of salt rounds
            
            // Create a new user record in the database
            await User.create({
                username,
                email,
                password: hashedPassword,
            });

            // Respond with a success message and a 201 Created status code
            res.status(201).json({
                message: "User registered successfully."
            });
        } catch (error) {
            console.error(error); // Log the error for debugging purposes
            // Respond with a 500 Internal Server Error status code if registration fails
            res.status(500).json({
                message: "Error registering user. Please try again."
            });
        }
    }

    /**
     * Logs in a user by verifying their credentials.
     * 
     * @param req - The HTTP request object containing the user's email and password.
     * @param res - The HTTP response object used to send responses back to the client.
     */
    static async login(req: Request, res: Response) {
        // Extract email and password from the request body
        const { email, password } = req.body;

        // Input validation: Ensure both email and password are provided
        if (!email || !password) {
            res.status(400).json({
                message: "Please provide email and password." // Inform the client of missing credentials
            });
            return 
        }

        try {
            // Find the user by their email in the database
            const user = await User.findOne({ where: { email } });

            // If no user is found, respond with a 404 Not Found status
            if (!user) {
                 res.status(404).json({
                    message: "No user found with that email." // Inform the client that the email is not registered
                });
                return 
            }

            // Compare the provided password with the hashed password stored in the database
            const isEqual = await bcrypt.compare(password, user.password);
            if (!isEqual) {
              res.status(401).json({
                    message: "Invalid password." // Inform the client of incorrect password
                });
                return 
            }

            // Generate a JWT token for the authenticated user
            const token = generateToken(user.id);
            // Respond with a success message, including the JWT token and a 200 OK status
            res.status(200).json({
                message: "Logged in successfully.",
                token
            });
        } catch (error) {
            console.error(error); // Log the error for debugging purposes
            // Respond with a 500 Internal Server Error status if login fails
            res.status(500).json({
                message: "Error logging in. Please try again."
            });
        }
    }

    /**
     * Handles the password reset request by sending an OTP to the user's email.
     * 
     * @param req - The HTTP request object containing the user's email.
     * @param res - The HTTP response object used to send responses back to the client.
     */
    static async handleForgotPassword(req: Request, res: Response) {
        // Extract email from the request body
        const { email } = req.body;

        // Input validation: Ensure the email is provided
        if (!email) {
           res.status(400).json({
                message: "Please provide your email." // Inform the client that the email is required
            });
            return 
        }

        try {
            // Find the user by their email in the database
            const user = await User.findOne({ where: { email } });

            // If no user is found, respond with a 404 Not Found status
            if (!user) {
                 res.status(404).json({
                    message: "Email not registered." // Inform the client that the email is not associated with any user
                });
                return 
            }

            // Generate a One-Time Password (OTP) for the password reset process
            const otp = generateOtp();
            // Send the OTP to the user's email address
            await sendMail({
                to: email,
                subject: "Password Change Request",
                text: `You requested a password reset. Here is your OTP: ${otp}`
            });

            // Respond with a success message indicating the email has been sent
            res.status(200).json({
                message: "Password reset email sent."
            });
        } catch (error) {
            console.error(error); // Log the error for debugging purposes
            // Respond with a 500 Internal Server Error status if sending the email fails
            res.status(500).json({
                message: "Error sending email. Please try again."
            });
        }
    }
}

export default UserController; // Export the UserController class for use in other parts of the application
