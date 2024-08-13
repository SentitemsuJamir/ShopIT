import mongoose from "mongoose";
import bcypt from "bcryptjs";
import jwt from "jsonwebtoken";
import crypto from "crypto";

const userSchema=new mongoose.Schema({
    name:{
        type: String,
        required: [true, "Please enter a product name"],
        maxLength: [200, "Product name cannot exceed 200 characters"],
    },
    email:{
        type: String,
        required: [true, "Please enter your email"],
        unique:true,
    },
    password:{
        type: String,
        required: [true, "Please enter your password"],
        minLength:[6,"Your password should be longer than 6 characters"],
        select:false,
    },
    avatar:
        {
        public_id: String,
        url: String,
    },
    role: {
        type: String,
        default: "user",
    },
    resetPasswordToken: String,
    resetPasswordExpire: Date,
},
{timestamps: true}
);

//encrypting password before saving
userSchema.pre("save", async function(next){
    if(!this.isModified("password")){
        next();
    }
    this.password= await bcypt.hash(this.password, 10);
});


//return JWT token

userSchema.methods.getJwtToken = function(){
   return jwt.sign({id:this._id}, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRES_TIME
    });
}

//compare password

userSchema.methods.comparePassword = async function(enteredPassword){
    return await bcypt.compare(enteredPassword, this.password);
};

//generate password reset token
userSchema.methods.getResetPasswordToken = function(){
    //generate token
    const resetToken =crypto.randomBytes(20).toString("hex");
    //hash and set to resetToken field
    this.resetPasswordToken=crypto
        .createHash("sha256")
        .update(resetToken)
        .digest('hex');

    //set token expire time
    this.resetPasswordExpire=Date.now()+30 * 60 * 1000;

    return resetToken;
}

export default mongoose.model("User", userSchema);