import { config } from "dotenv"
config()


 export const envConfig ={
    port : process.env.PORT,
    connectionstring : process.env.CONNECTION_STRING
}