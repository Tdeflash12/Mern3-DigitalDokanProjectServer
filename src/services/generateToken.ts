import  Jwt  from "jsonwebtoken"
import { envConfig } from "../config/config"


const generateToken = (userId : string)=>{
  // token generate (JWT)
const token = Jwt.sign({userId: userId},envConfig.jwtSecretKey as string,{
    expiresIn : envConfig.jwtExpiresIn
})
  return token
}
export default generateToken