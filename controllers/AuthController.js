'use strict'

require('dotenv').config({ path: './config.env' });
const User = require('../models/User');
const ApiError = require('../utils/ApiError');
const { transporter, sendMail } = require('../utils/Nodemailer')
const RandomToken = require('../utils/RandomToken');
const isProductionEnv = require('../utils/IsProduction');
const signToken = require('../utils/SignToken');

const cookieOptions = {
    expires: new Date(Date.now() + process.env.COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000),
    httpOnly: true
}


//Registracija
exports.register = async function (req, res, next) {
    try {

        const emailToken = RandomToken();
        const newUser = await User.create({
            username: req.body.username,
            email: req.body.email,
            password: req.body.password,
            passwordConfirm: req.body.passwordConfirm,
            email_confirmation_token: emailToken
        });
        const token = signToken(newUser._id);
        if (isProductionEnv()) cookieOptions.secure = true;

        const mailOptions = {
            from: {
                name: 'Quizko edIT',
                address: process.env.USER
            },
            to: newUser.email,
            subject: "Dobrodošli u Quizko aplikaciju!",
            html: `<h2>Uspješno ste se registrirali u aplikaciju</h2>
                    <p>Klikom na sljedeći <a href="${process.env.RENDER_HOST_EMAIL}/${newUser._id}/${emailToken}">link</a> možete aktivirati svoj račun.</p>
                    <p>Nakon aktivacije računa, možete koristiti sve značajke aplikacije.</p>`
        }

        try {
            await sendMail(transporter, mailOptions);
        }
        catch (err) {
            return next(new ApiError("E-mail se nije uspio poslati. Pokušajte ponovno.", 500));
        }

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


exports.confirmEmailAddress = async function (req, res, next) {
    try {
        const user = await User.findById(req.params.id);
        if (user.hasConfirmedEmail(user)) return next(new ApiError("Vaša e-mail adresa je već potvrđena.", 400));
        if (!user) throw new ApiError("Korisnik ne postoji.", 404);

        if (user.email_confirmation_token !== req.params.token) {
            user.email_confirmation_token = undefined;
            user.has_confirmed_email = false;
            await user.save();
            throw new ApiError("Tokeni se ne podudaraju. Ponovno pošaljite e-mail za aktivaciju računa.", 400);
        }

        user.email_confirmation_token = undefined;
        user.has_confirmed_email = true;
        await user.save();


        res.status(200).json({
            status: 'success',
            message: 'E-mail adresa uspješno potvrđena.'
        })
    }
    catch (err) {
        return next(err);
    }
}

exports.resendEmail = async function (req, res, next) {
    try {
        const user = await User.findById(req.user.id);
        if (user.hasConfirmedEmail(user)) throw new ApiError("Vaša e-mail adresa je već potvrđena.", 400);
        const emailToken = RandomToken();

        user.email_confirmation_token = emailToken;
        user.has_confirmed_email = false;
        await user.save();

        const mailOptions = {
            from: {
                name: 'Quizko edIT',
                address: process.env.USER
            },
            to: user.email,
            subject: "E-mail za aktivaciju računa",
            html: `<p>Klikom na sljedeći <a href="${process.env.RENDER_HOST_EMAIL}/${user._id}/${emailToken}">link</a> možete aktivirati svoj račun.</p>`
        }

        try {
            await sendMail(transporter, mailOptions);
        }
        catch (err) {
            return next(new ApiError("E-mail se nije uspio poslati. Pokušajte ponovno.", 500));
        }

        res.status(200).json({
            status: 'success',
            message: "E-mail uspješno poslan."
        })
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
