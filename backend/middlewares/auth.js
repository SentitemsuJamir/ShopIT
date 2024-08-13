import catchAsyncErrors from "./catchAsyncErrors.js";
import ErrorHandler from "../utils/errorHandler.js";
import jwt from "jsonwebtoken";
import User from "../models/user.js";

// Checks if user is authenticated or not
export const isAuthenticatedUser = catchAsyncErrors(async (req, res, next) => {
    // Log the cookies to see what is being sent
   // console.log("Cookies: ", req.cookies);

    const token = req.cookies?.token;
    
    if (!token) {
        return next(new ErrorHandler("Login first to access this resource", 401));
    }
    
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = await User.findById(decoded.id);
        
        if (!req.user) {
            return next(new ErrorHandler("User not found", 404));
        }
        
        next();
    } catch (err) {
        return next(new ErrorHandler("Invalid Token. Please log in again.", 401));
    }
});


//authorize user roles

export const authorizeRoles =(...roles)=>{
    return (req,res,next)=>{
        if(!roles.includes(req.user.role)){
            return next(new ErrorHandler(`Role ${req.user.role} is not allowed to access this resource`, 403));
        }
        next();
    }
}
