import mongoose from "mongoose";

export const connectDatabase = () => {
    const DB_URI = process.env.DB_LOCAL_URI || process.env.DB_URI;

    mongoose.connect(DB_URI, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    }).then(() => {
        console.log("Mongoose connected to MongoDB");
    }).catch((error) => {
        console.error("Mongoose connection error:", error);
    });
};
