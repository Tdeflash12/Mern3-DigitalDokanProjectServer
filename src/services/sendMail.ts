import nodemailer from "nodemailer"
import { envConfig } from "../config/config"

interface IData{
    to :string,
    subject : string,
    text : string,

}
const sendMail = async (data:IData) => {
    const trasnsporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: envConfig.Email,
            pass: envConfig.Password
        }
    })
    const mailOptions = {
        from: "abheshmandal2492gmail.com>",
        to: data.to,
        subject: data.subject,
        text: data.text
    }
  try {
    await trasnsporter.sendMail(mailOptions)
  } catch (error) {
    console.log(error)
    
  }
}
export default sendMail