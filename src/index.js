import dotenv from "dotenv"
import connectDB from "./db/database.js";
import { app } from "./app.js";

dotenv.config({
    path: "./env"
})

connectDB().then(() => {
    app.listen(process.env.PORT || 8000, () => {
        console.log("SERVER IS RUNNING")
    })
}).catch((error) => {
    console.log("MONGODB CONNECTION ERROR !!!", error);
})

