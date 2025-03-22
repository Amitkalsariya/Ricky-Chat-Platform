import jwt  from "jsonwebtoken"
import User from "../models/user.model.js"
export const protectRoute =async (req,res,next)=>{
    try {
        const token =req.cookies.jwt
        if(!token)
        {
            return res.status(401).json({
                message:"No token Provided : Unauthorized "
            })
        }
        const decoded= jwt.verify(token,process.env.JWT_SECRET)
        if(!decoded)
        {
            return res.status(401).json({
                message:"Invalid Token : Unauthorized "
            })
        }
        const user=await User.findById(decoded.userId).select("-password")

        if(!user)
        {
            return res.status(401).json({
                message:"User Not Found"
            })     
        }

        req.user=user
        next()
    } catch (error) {
        console.log("Error In Protect Route Middleware", error.message);
        res.status(500).json({
          message: "Something Went Wrong As an Internal Error",
        });
    }
}

