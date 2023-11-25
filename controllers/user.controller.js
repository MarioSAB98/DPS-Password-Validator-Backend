require('dotenv').config()
const userModel = require("../models/user");
const AppError = require('../utils/AppError');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const signUp = async (req, res, next) => {
    const { fullname, email, password } = req.body;
    const existingUser = await userModel.findOne({ email });
    if (existingUser) return next(new AppError("A user already exists with the same email.", 400, [{ path: ["email"], message: "A user already exists with the same email.", type: "string.email" }]));

    // If no existing user, proceed with creating a new user
    const addedUser = await userModel.create({ fullname, email, password });
    addedUser.password = undefined;
    res.status(201).json({ message: 'success', addedUser });
}

const logIn = async (req, res, next) => {
    const { email, password } = req.body;
    const foundedUser = await userModel.findOne({ email }).select('+password');

    if (!foundedUser) return next(new AppError("No user found with this email", 404, [{ path: ["email"], message: "No user found with this email", type: "string.email" }]));
    const isMatch = await bcrypt.compare(password, foundedUser.password)
    if (!isMatch) return next(new AppError("Password is not correct", 404, [{ path: ["password"], message: "Password is not correct", type: "string.password" }]));
    const token = await jwt.sign({ id: foundedUser._id }, process.env.JWT_SECRET_KEY);
    foundedUser.password = undefined;
    res.status(200).json({ token, foundedUser });
}

module.exports = { signUp, logIn };