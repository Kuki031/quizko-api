'use strict'


const jwt = require('jsonwebtoken');
const { promisify } = require('util');
const User = require('../models/userModel');
const ApiError = require('../utils/ApiError');


//JWT options
const cookieOptions = {
    expires: new Date(Date.now() + process.env.COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000),
    httpOnly: true
}
const signToken = function (id) {
    return jwt.sign({ id: id }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRES_IN
    });
}




//Registracija
exports.register = async function (req, res, next) {
    try {
        const newUser = await User.create({
            username: req.body.username,
            email: req.body.email,
            password: req.body.password,
            passwordConfirm: req.body.passwordConfirm,
        });
        const token = signToken(newUser._id);
        res.cookie("quizko", token, cookieOptions).status(201).json({
            status: 'success',
            data: newUser,
            token
        });

    }
    catch (error) {
        return next(new ApiError('Nešto nije u redu.', 500));
    }
}


//Prijava
exports.logIn = async function (req, res, next) {
    try {

        const { email, password } = req.body;
        if (!email || !password) return next(new ApiError("Morate unjeti e-mail i lozinku prilikom prijave.", 400));

        const user = await User.findOne({ email: email }).select('+password');
        if (!user || !await user.comparePw(password, user.password)) return next(new ApiError(`Neispravan e-mail: "${email}" ili lozinka.`), 401);


        const token = signToken(user.id);
        res.cookie("quizko", token, cookieOptions).status(200).json({
            status: 'success',
            user,
            token
        });

    }
    catch (e) {
        return next(new ApiError('Nešto nije u redu.', 500));
    }
}


//Middleware => Provjera jel user prijavljen
exports.isLoggedIn = async function (req, res, next) {
    let token;
    try {
        if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
            token = req.headers.authorization.split(" ")[1];
        }

        if (!token) return next(new ApiError("Niste prijavljeni u aplikaciju.", 403));
        const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);

        const currentUser = await User.findById(decoded.id);
        if (!currentUser) return next(new ApiError('Korisnik ne postoji.', 404));

        req.user = currentUser;
        next();
    }
    catch (err) {
        console.log(err);
        return next(new ApiError("Nešto nije u redu.", 500));
    }
}


//Dohvati moj profil
exports.getMyProfile = async function (req, res, next) {

    try {
        const user = await User.findById(req.user.id);
        res.status(200).json({
            status: 'success',
            user
        });
    }
    catch (err) {
        console.log(err);
        return next(new ApiError("Nešto nije u redu.", 500));
    }
}
