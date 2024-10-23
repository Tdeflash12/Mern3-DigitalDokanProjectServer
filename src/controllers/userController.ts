import { Request, Response } from "express";
import User from "../database/models/userModel";
import bcrypt from "bcrypt";
import generateToken from "../services/generateToken";


class UserController {
    static async register(req: Request, res: Response) {
        //incoming user data receive 
        const { username, email, password } = req.body
        if (!username || !email || !password) {
            res.status(400).json({
                message: "Please provide username,email,password"
            })
            return
        }
        // data --> users table ma insert garne 
        await User.create({
            username,
            email,
            password: bcrypt.hashSync(password, 10),

        })

        // await sequelize.query(`INSERT INTO users(id,username,email,password) VALUES (?,?,?,?)`, {
        //     replacements : ['b5a3f20d-6202-4159-abd9-0c33c6f70487', username,email,password], 
        // })

        res.status(201).json({
            message: "User registered successfully"
        })
    }
  static  async login(req: Request, res: Response) {
        //accept the incoming data ---> email and password from the users
        const { email, password } = req.body // abhesh ---> Sending through Plain text ---> hash() 343ifuyd4u58
        if (!email || !password) {
            res.status(400).json({
                message: "PLelase provide the email and password😢"
            })
        }
        return

        const [user] = await User.findAll({ // find = findAll --> return data in an array , findById = findByPk---> OBJECT
            where: {
                email: email
            }
        })
        // passwor are stored in hash form Anhesh ----> 343ifuyd4u58
        // IF yes then check password too
        if (!user) {
            res.status(404).json({
                message: "No useer with that email😢"
            })
        } else {
            // IF yes--> email exits then check password too
            const isEqual = bcrypt.compareSync(password, user.password)
            if (!isEqual) {
                res.status(404).json({
                    message: "Invalid Password From the user😢"
                })
            }else{

                 const token = generateToken(user.id)
                // if Password milyo vnney --> JWT token
                res.status(200).json({
                    message : "Logged in Sucessfully❤😍",
                    token 
                })
            }
     }

    }

}


export default UserController