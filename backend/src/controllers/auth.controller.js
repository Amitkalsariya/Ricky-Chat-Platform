import cloudinary from "../lib/cloudinary.js";
import { gnttoken } from "../lib/utils.js";
import User from "../models/user.model.js";
import bcrypt from "bcryptjs";
export const signup = async (req, res) => {
  const { fullname, email, password } = req.body;
  try {
    if (!fullname || !email || !password) {
      return res.status(400).send({
        message: "Please Filled All The Feilds ",
      });
    }
    if (password.length < 6) {
      return res.status(400).send({
        message: "Password Must be at least 6 Characters",
      });
    }
    const user = await User.findOne({ email });
    if (user)
      return res.status(400).send({
        message: "Email Already Exist",
      });

    const hashpwd = await bcrypt.hash(password, 10);

    const newUser = new User({
      fullname,
      email,
      password: hashpwd,
    });
    if (newUser) {
      gnttoken(newUser._id, res);

      await newUser.save();

      res.status(201).json({
        _id: newUser._id,
        fullname: newUser.fullname,
        email: newUser.email,
        profilePic: newUser.profilePic,
      });
    } else {
      res.status(400).json({
        message: "Invalid User Data",
      });
    }
  } catch (error) {
    console.log("Error In Signup controller", error.message);
    res.status(500).json({
      message: "Something Went Wrong",
    });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({
        message: "Invalid Credentials",
      });
    }
    const checkpwd = await bcrypt.compare(password, user.password);
    if (!checkpwd) {
      return res.status(400).json({
        message: "Password Is Wrong",
      });
    }
    gnttoken(user._id, res);

    res.status(200).json({
      _id: user._id,
      fullname: user.fullname,
      email: user.email,
      profilePic: user.profilePic,
    });
  } catch (error) {
    console.log("Error In Login controller", error.message);
    res.status(500).json({
      message: "Something Went Wrong As an Internal Error",
    });
  }
};

export const logout = (req, res) => {
  try {
    res.cookie("jwt", "", { maxAge: 0 });
    return res.status(200).json({
      message: "Logout Successfully",
    });
  } catch (error) {
    console.log("Error In Login controller", error.message);
    res.status(500).json({
      message: "Something Went Wrong As an Internal Error",
    });
  }
};

export const updateProfile = async (req, res) => {
  try {
    const { profilePic } = req.body;
    const userId = req.user._id;
    if (!profilePic) {
      return res.status(400).json({
        message: "Profile Pic is Required",
      });
    }
    const uploadResponse = await cloudinary.uploader.upload(profilePic);
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { profilePic: uploadResponse.secure_url },
      { new: true }
    );
    res.status(200).json(updatedUser);
  } catch (error) {
    console.log("Error In Update Profiler", error.message);
    res.status(500).json({
      message: "Something Went Wrong As an Internal Error",
    });
  }
};
 export const checkAuth = (req,res)=>{
try {
  res.status(200).json(req.user)
} catch (error) {
  console.log("Error In CheckAuth controller", error.message);
    res.status(500).json({
      message: "Something Went Wrong As an Internal Error",
    });
}
 }