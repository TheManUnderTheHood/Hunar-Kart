import mongoose from "mongoose";
import {DB_NAME} from "../constants.js";

const connectDB = async() => {
    try{
        const con = await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`)
        console.log(`\nMongoDB Connected !! DB Host: ${con.connection.host}`);
        
    }
    catch(error){
        console.error("MongoDB Connection Error: ", error);
        process.exit(1)
    }
}

export default connectDB