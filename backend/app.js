import express from "express"
const app=express();
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import { connectDatabase } from "./config/dbConnect.js";
import errorMiddleware from "./middlewares/error.js";
import bodyParser from "body-parser";




//Handle Uncaught exception
process.on(`uncaughtException`, (err) => {
    console.log(`Error: ${err}`);
    console.log("Shutting down Server due to uncaught exception");
    process.exit(1);
   
});

dotenv.config({path : "backend/config/config.env"});
//connecting to database
connectDatabase();

app.use(express.json({ limit: "10mb",
    verify: (req, res, buf)=>{
        req.rawBody = buf.toString();
    },
 }));
app.use(cookieParser());



//import all routes
import productRoutes from "./routes/products.js"
import authRoutes from "./routes/auth.js"
import orderRoutes from "./routes/order.js";
import paymentRoutes from "./routes/payment.js";


app.use("/api", productRoutes);
app.use("/api", authRoutes);
app.use("/api",orderRoutes)
app.use("/api",paymentRoutes)


//using error middleware
app.use(errorMiddleware);

const server=app.listen(process.env.PORT, ()=>{
    console.log(`Server started on PORT: ${process.env.PORT} in ${process.env.ENV} mode`);
});

process.on(`unhandledRejection`, (err) => {
    console.log(`Error: ${err}`);
    console.log("Shutting down Server due to unhandled Promise Rejection");
    server.close(() => {
        process.exit(1);
    });
});
