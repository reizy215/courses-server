import mongoose from "mongoose";

import { userModel } from "../models/user.js"
import { generateToken } from "../utils/generateToken.js";

//פונקצית רישום משתמש חדש
export const signUp = async (req, res) => {
    let { body } = req;
    if (!body.userName || !body.password || !body.email)
        return res.status(400).json({ title: "Error, you cant sign up", message: "details are missing" });

    const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/;
    // אם הסיסמה לא תואמת את הפורמט, מחזירים הודעת שגיאה
    if (!passwordRegex.test(body.password))
        return res.status(400).json({ title: "Error, password format is incorrect", message: "Password must contain at least 8 characters, letters and numbers." });

    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    // אם המייל לא תואם לפורמט, מחזירים הודעת שגיאה
    if (!emailRegex.test(body.email))
        return res.status(400).json({ title: "Error, email format is incorrect", message: "Please provide a valid email address." });

    try {
        let data = await userModel.findOne({ userName: body.userName, password: body.password });
        if (data)
            return res.status(409).json({ title: "Error, you cant sign up", message: "choose a different userName or password." });
        let newUser = new userModel(body);
        data = await newUser.save();
        let userWithoutPassword = data.toObject();
        delete userWithoutPassword.password;
        let token = generateToken(userWithoutPassword);
        res.json({ ...userWithoutPassword, token })
    }
    catch (err) {
        return res.status(400).json({ title: "Error, you cant sign up", message: err.message });
    }
}

//פונקציה שמחזירה את כל המשתמשים
export const getAllUsers = async (req, res) => {
    let limit = req.query.limit || 20;
    let page = req.query.page || 1;
    try {
        let data = await userModel.find().select('-password').skip((page - 1) * limit).limit(limit);
        res.json(data);
    }
    catch (err) {
        res.status(400).json({ title: "Error, it is not possible to get the list of all users", message: err.message });
    }
}

//ID פונקציה שמחזירה משתמש לפי
export const getUserById = async (req, res) => {
    let { id } = req.params;
    if (!mongoose.isValidObjectId(id))
        return res.status(400).json({ title: "Error", message: "The id is not valid" });
    try {
        let data = await userModel.findById(id).select('-password');
        if (!data)
            return res.status(404).json({ title: "Error", message: "The ID does not exist" });
        res.json(data);
    }
    catch (err) {
        res.status(400).json({ title: "Error, the user cannot be displayed by ID", message: err.message });
    }
}

//פונקציה שמעדכנת פרטי משתמש לא כולל סיסמה
export const UpdateExceptPassword = async (req, res) => {
    let { id } = req.params;
    if (!mongoose.isValidObjectId(id))
        return res.status(400).json({ title: "Error", message: "The id is not valid" });
    try {
        if (req.body.password)
            return res.status(400).json({ title: "Error", message: "Password cannot be updated in this option" });
        let data = await userModel.findByIdAndUpdate(id, req.body, { new: true });
        if (!data)
            return res.status(404).json({ title: "Error", message: "The ID does not exist" });
        res.json(data);
    }
    catch (err) {
        res.status(400).json({ title: "Error, the user cannot be updated", message: err.message });
    }
}

//פונקציה שמעדכנת סיסמת משתמש
export const UpdatePassword = async (req, res) => {
    let { id } = req.params;
    if (!mongoose.isValidObjectId(id))
        return res.status(400).json({ title: "Error", message: "The id is not valid" });
    try {
        if (!req.body.password)
            return res.status(400).json({ title: "Error", message: "Password is missing" });
        let data = await userModel.findByIdAndUpdate(id, req.body, { new: true });
        if (!data)
            return res.status(404).json({ title: "Error", message: "The ID does not exist" });
        res.json(data);
    }
    catch (err) {
        res.status(400).json({ title: "Error, the user password cannot be updated.", message: err.message });
    }
}

//פונקציה שמחזירה משתמש לפי סיסמה ושם משתמש
export const logIn = async (req, res) => {
    let { userName, password } = req.body;
    if (!userName || !password)
        return res.status(400).json({ title: "Error, missing details.", message: "Password / userName is missing" });
    try {
        let data = await userModel.findOne({ userName: userName, password: password }).select('-password');
        if (!data)
            return res.status(404).json({ title: "Error, you cant login", message: "There is no user with such details" });
        let token = generateToken(data);
        res.json({ ...data.toObject(), token });
    }
    catch (err) {
        res.status(400).json({ title: "Error, you cant login.", message: err.message });
    }
}