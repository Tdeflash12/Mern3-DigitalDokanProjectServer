import { Sequelize} from "sequelize-typescript";
import { envConfig } from "../config/config";
const sequelize = new Sequelize(envConfig.connectionstring as string );

try {
    sequelize.authenticate()
    .then(()=>{
        console.log("milyo hai db ko Authentication!!!!")
    })
    .catch(err=>{
        console.log("error aayo hai !!!",err)
    })
} catch (error) {
   console.log(error); 
}
export default sequelize