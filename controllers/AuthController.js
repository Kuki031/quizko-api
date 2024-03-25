'use strict'


const jwt = require('jsonwebtoken');
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
        if (process.env.NODE_ENV === 'production') cookieOptions.secure = true;
        res.cookie("jwt", token, cookieOptions).status(201).json({
            status: 'success',
            data: newUser,
            token
        });

    }
    catch (error) {
        if (error.name === 'ValidationError') return next(new ApiError(error.message, 400));
        return next(new ApiError('Nešto nije u redu.', 500));
    }
}


//Prijava
exports.logIn = async function (req, res, next) {
    try {

        const { email, password } = req.body;
        if (!email || !password) return next(new ApiError("Morate unjeti e-mail i lozinku prilikom prijave.", 400));

        const user = await User.findOne({ email: email }).select('+password');
        if (!user || !await user.comparePw(password, user.password)) return next(new ApiError(`Neispravan e-mail: "${email}" ili lozinka.`, 401));


        const token = signToken(user.id);
        if (process.env.NODE_ENV === 'production') cookieOptions.secure = true;
        res.cookie("jwt", token, cookieOptions).status(200).json({
            status: 'success',
            user,
            token
        });

    }
    catch (e) {
        return next(new ApiError('Nešto nije u redu.', 500));
    }
}



//Dohvati moj profil
exports.getMyProfile = async function (req, res, next) {

    try {

        const user = await User.findById(req.user.id);
        if (!user) return next(new ApiError("Niste prijavljeni u aplikaciju.", 401));

        res.status(200).json({
            status: 'success',
            user
        });
    }
    catch (err) {
        return next(new ApiError("Nešto nije u redu.", 500));
    }
}


//Update profila
exports.updateMe = async function (req, res, next) {
    try {
        const user = await User.findByIdAndUpdate(req.user.id, {
            username: req.body.username
        }, {
            runValidators: true,
            new: true
        });

        if (!user) return next(new ApiError("Korisnik nije pronađen", 404));

        const token = signToken(user._id);
        if (process.env.NODE_ENV === 'production') cookieOptions.secure = true;
        res.cookie("jwt", token, cookieOptions).status(200).json({
            status: 'success',
            user,
            token
        });
    }
    catch (e) {
        if (e.name === 'ValidationError') return next(new ApiError(e.message, 400));
        if (e.name === 'DuplicateKeyError') return next(new ApiError(e.message, 400));

        return next(new ApiError("Nešto nije u redu.", 500));
    }
}

//Deaktivacija računa
exports.deactivateMe = async function (req, res, next) {
    try {

        const user = await User.findById(req.user.id);
        if (!user.isAccountActive) return next(new ApiError("Već Vam je deaktiviran račun.", 400));

        await User.findByIdAndUpdate(req.user.id, {
            isAccountActive: false
        }, {
            runValidators: true,
            new: true
        });

        res.status(200).json({
            status: 'success',
            message: 'Račun uspješno deaktiviran. Svoj račun možete aktivirati ponovno kada poželite.'
        });
    }
    catch (e) {
        return next(new ApiError("Nešto nije u redu.", 500));
    }
}


//Reaktivacija računa
exports.activateMe = async function (req, res, next) {
    try {

        const user = await User.findById(req.user.id);
        if (user.isAccountActive) return next(new ApiError("Već Vam je aktiviran račun.", 400));

        await User.findByIdAndUpdate(req.user.id, {
            isAccountActive: true
        }, {
            runValidators: true,
            new: true
        });
        res.status(200).json({
            status: 'success',
            message: 'Račun uspješno aktiviran. Možete koristiti ostale značajke aplikacije.'
        });
    }
    catch (e) {
        return next(new ApiError("Nešto nije u redu.", 500));
    }
}

//Promjena lozinke
exports.changePassword = async function (req, res, next) {
    try {
        const { password, passwordNew, passwordRepeat } = req.body;
        if (!password || !passwordNew || !passwordRepeat) return next(new ApiError('Morate unjeti svoju trenutnu lozinku, novu lozinku, te ponoviti novu lozinku.', 400));
        const user = await User.findOne({ _id: req.user.id }).select("+password");


        if (!await user.comparePw(password, user.password)) return next(new ApiError('Netočna trenutna lozinka.', 400));
        user.password = passwordNew;
        user.passwordConfirm = passwordRepeat;


        const token = signToken(user._id);
        if (process.env.NODE_ENV === 'production') cookieOptions.secure = true;


        await user.save({ validateModifiedOnly: true });
        res.status(200).cookie('jwt', token, cookieOptions).json({
            status: 'success',
            token,
            message: 'Lozinka uspješno promjenjena.'
        })

    }
    catch (e) {
        return next(new ApiError("Nešto nije u redu.", 500));
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
