'use strict'


const jwt = require('jsonwebtoken');
const User = require('../models/User');
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

const isProductionEnv = () => process.env.NODE_ENV === 'production';



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
        if (isProductionEnv()) cookieOptions.secure = true;
        res.cookie("jwt", token, cookieOptions).status(201).json({
            status: 'success',
            data: newUser,
            token
        });
    }
    catch (err) {
        return next(err);
    }
}


//Prijava
exports.logIn = async function (req, res, next) {
    try {

        const { email, password } = req.body;
        if (!email || !password) throw new ApiError("Morate unjeti e-mail i lozinku prilikom prijave.", 400);

        const user = await User.findOne({ email: email }).select('+password');
        if (!user || !await user.comparePw(password, user.password)) throw new ApiError(`Neispravan e-mail: "${email}" ili lozinka.`, 401);


        const token = signToken(user.id);
        if (isProductionEnv()) cookieOptions.secure = true;
        res.cookie("jwt", token, cookieOptions).status(200).json({
            status: 'success',
            user,
            token
        });

    }
    catch (err) {
        return next(err);
    }
}



//Dohvati moj profil
exports.getMyProfile = async function (req, res, next) {

    try {

        const user = await User.findById(req.user.id);
        if (!user) throw new ApiError("Niste prijavljeni u aplikaciju.", 401);

        res.status(200).json({
            status: 'success',
            user
        });
    }
    catch (err) {
        return next(err);
    }
}


//Update profila
exports.updateMe = async function (req, res, next) {
    try {
        const user = await User.findByIdAndUpdate(req.user.id, {
            username: req.body.username,
            email: req.body.email
        }, {
            runValidators: true,
            new: true
        });

        if (!user) throw new ApiError("Korisnik nije pronađen.", 404);

        const token = signToken(user._id);
        if (isProductionEnv()) cookieOptions.secure = true;
        res.cookie("jwt", token, cookieOptions).status(200).json({
            status: 'success',
            user,
            token
        });
    }
    catch (err) {
        return next(err);
    }
}


//Promjena lozinke
exports.changePassword = async function (req, res, next) {
    try {
        const { password, passwordNew, passwordRepeat } = req.body;
        if (!password || !passwordNew || !passwordRepeat) throw new ApiError('Morate unjeti svoju trenutnu lozinku, novu lozinku, te ponoviti novu lozinku.', 400);
        const user = await User.findOne({ _id: req.user.id }).select("+password");


        if (!await user.comparePw(password, user.password)) throw new ApiError('Netočna trenutna lozinka.', 400);
        user.password = passwordNew;
        user.passwordConfirm = passwordRepeat;


        const token = signToken(user._id);
        if (isProductionEnv()) cookieOptions.secure = true;


        await user.save({ validateModifiedOnly: true });
        res.status(200).cookie('jwt', token, cookieOptions).json({
            status: 'success',
            token,
            message: 'Lozinka uspješno promjenjena.'
        })

    }
    catch (err) {
        return next(err);
    }
}

//Brisanje cijelog profila (iz baze)
exports.deleteMyAccount = async function (req, res, next) {
    try {
        await User.findByIdAndDelete(req.user.id);
        res.status(204).json({
            status: 'success',
            data: null
        })
    }
    catch (err) {
        return next(err);
    }
}



//Odjava
exports.logOut = function (req, res) {
    res.cookie('jwt', '', {
        expiresIn: new Date(Date.now() + 10 * 1000),
        httpOnly: true
    })
    res.status(200).json({
        status: 'success',
        message: 'Uspješno ste se odjavili iz aplikacije.'
    })
}
