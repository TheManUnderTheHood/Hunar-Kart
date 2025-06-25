import mongoose from "mongoose";
import {DB_NAME} from "../constants.js";

const connectDB = async() => {
    try{
        const con = await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`)
        console.log(`\n Connected !! DB Host: ${con.connection.host}`);
        
    }
    catch(error){
        console.error("Connection Error ", error);
        process.exit(1)
    }
}

export default connectDB