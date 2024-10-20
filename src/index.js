import dotenv from "dotenv"
import connectDB from "./db/index.js";

dotenv.config({
    path: "./env"
})

connectDB()


// import express from "express"
// const app = express()

//     ; (
//         async () => {
//             try {
//                 mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`)
//                 app.on("error", () => {
//                     console.log("There is a error in database connection")
//                 })

//                 app.listen(process.env.PORT, () => {
//                     console.log("Server is Running")
//                 })
//             } catch (error) {
//                 console.log("ERROR", error)
//             }
//         })()