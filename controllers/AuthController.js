'use strict'

require('dotenv').config({ path: './config.env' });
const User = require('../models/User');
const ApiError = require('../utils/ApiError');
const { transporter, sendMail } = require('../utils/Nodemailer')
const RandomToken = require('../utils/RandomToken');
const isProductionEnv = require('../utils/IsProduction');
const signToken = require('../utils/SignToken');
const Options = require('../utils/EmailOptions');
const Cookie = require('../utils/CookieOptions');


//Registracija
exports.register = async function (req, res, next) {
    try {
        const cookie = new Cookie('', '');
        const emailToken = RandomToken();
        const newUser = await User.create({
            username: req.body.username,
            email: req.body.email,
            password: req.body.password,
            passwordConfirm: req.body.passwordConfirm,
            email_confirmation_token: emailToken
        });
        const token = signToken(newUser._id);
        if (isProductionEnv()) cookie._setAttributes();

        const html = `
        <h2>Uspješno ste se registrirali u aplikaciju</h2>
        <p>Klikom na sljedeći <a href="${process.env.RENDER_HOST_EMAIL}/${newUser._id}/${emailToken}">link</a> možete aktivirati svoj račun.</p>
        <p>Nakon aktivacije računa, možete koristiti sve značajke aplikacije.</p>
        `
        const mailOptions = new Options({ name: 'Quizko edIT', address: process.env.USER }, newUser.email, "Dobrodošli u Quizko aplikaciju!", html);
        try {
            await sendMail(transporter, mailOptions);
        }
        catch (err) {
            return next(new ApiError("E-mail se nije uspio poslati. Pokušajte ponovno.", 500));
        }

        res.cookie("jwt", token, cookie).status(201).json({
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
            await user.save({ validateModifiedOnly: true });
            throw new ApiError("Tokeni se ne podudaraju. Ponovno pošaljite e-mail za aktivaciju računa.", 400);
        }

        user.email_confirmation_token = undefined;
        user.has_confirmed_email = true;
        await user.save({ validateModifiedOnly: true });


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
        await user.save({ validateModifiedOnly: true });


        const html = `<p>Klikom na sljedeći <a href="${process.env.RENDER_HOST_EMAIL}/${user._id}/${emailToken}">link</a> možete aktivirati svoj račun.</p>`;
        const mailOptions = new Options({ name: 'Quizko edIT', address: process.env.USER }, user.email, "E-mail za aktivaciju računa", html);
        try {
            await sendMail(transporter, mailOptions);
        }
        catch (err) {
            return next(new ApiError("E-mail se nije uspio poslati. Pokušajte ponovno.", 500));
        }

        res.status(200).json({
            status: 'success',
            message: "E-mail za aktivaciju računa uspješno poslan."
        })
    }
    catch (err) {
        return next(err);
    }
}


exports.forgotPassword = async function (req, res, next) {
    try {
        const user = await User.findOne({ email: req.body.email });
        if (!user) throw new ApiError(`Korisnik sa e-mail adresom "${req.body.email}" ne postoji.`, 404);
        if (!user.has_confirmed_email) throw new ApiError("E-mail adresa nije potvrđena, nije moguće poslati e-mail.", 403);

        const token = RandomToken();
        user.passwordResetToken = token;
        user.password_token_expires_at = Date.now() + (5 * 1000 * 60);
        await user.save({ validateModifiedOnly: true });


        const html = `<p>Klikom na sljedeći <a href="${process.env.RENDER_HOST_PASSWORD}/${user._id}/${token}">link</a> možete oporaviti svoju lozinku.</p>`;
        const mailOptions = new Options({ name: 'Quizko edIT', address: process.env.USER }, user.email, "E-mail za oporavak lozinke", html);
        try {
            await sendMail(transporter, mailOptions);
        }
        catch (err) {
            return next(new ApiError("E-mail se nije uspio poslati. Pokušajte ponovno.", 500));
        }

        res.status(200).json({
            status: 'success',
            message: 'E-mail za oporavak lozinke uspješno poslan.'
        })
    }
    catch (err) {
        return next(err);
    }
}

exports.resetPassword = async function (req, res, next) {
    try {
        const user = await User.findById(req.params.id);
        if (!user) throw new ApiError("Korisnik ne postoji.", 404);

        if (user.passwordResetToken !== req.params.token) {
            user.passwordResetToken = undefined;
            await user.save({ validateModifiedOnly: true });
            throw new ApiError("Tokeni se ne podudaraju. Ponovno pošaljite e-mail za oporavak lozinke.", 400);
        }
        if (user.password_token_expires_at < Date.now()) throw new ApiError("Token za oporavak lozinke je istekao. Molimo Vas ponovno pošaljite e-mail za oporavak lozinke.", 400);

        const password_new = req.body.password_new;
        const password_confirm = req.body.password_confirm;

        if (password_new !== password_confirm) throw new ApiError("Lozinke se ne podudaraju.", 400);

        user.password = password_new;
        user.passwordConfirm = password_confirm;
        user.passwordResetToken = undefined;
        user.password_token_expires_at = undefined;
        await user.save({ validateModifiedOnly: true });


        res.status(200).json({
            status: 'success',
            message: 'Lozinka uspješno oporavljena. Možete se prijaviti u aplikaciju.'
        })
    }
    catch (err) {
        return next(err);
    }
}


//Prijava
exports.logIn = async function (req, res, next) {
    try {
        const cookie = new Cookie('', '');
        const { email, password } = req.body;
        if (!email || !password) throw new ApiError("Morate unjeti e-mail i lozinku prilikom prijave.", 400);

        const user = await User.findOne({ email: email }).select('+password');
        if (!user || !await user.comparePw(password, user.password)) throw new ApiError(`Neispravan e-mail: "${email}" ili lozinka.`, 401);


        const token = signToken(user.id);
        if (isProductionEnv()) cookie._setAttributes();
        res.cookie("jwt", token, cookie).status(200).json({
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
        const cookie = new Cookie('', '');
        const user = await User.findByIdAndUpdate(req.user.id, {
            username: req.body.username,
            email: req.body.email
        }, {
            runValidators: true,
            new: true
        });

        if (!user) throw new ApiError("Korisnik nije pronađen.", 404);

        const token = signToken(user._id);
        if (isProductionEnv()) cookie._setAttributes();
        res.cookie("jwt", token, cookie).status(200).json({
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
        const cookie = new Cookie('', '');
        const { password, passwordNew, passwordRepeat } = req.body;
        if (!password || !passwordNew || !passwordRepeat) throw new ApiError('Morate unjeti svoju trenutnu lozinku, novu lozinku, te ponoviti novu lozinku.', 400);
        const user = await User.findOne({ _id: req.user.id }).select("+password");


        if (!await user.comparePw(password, user.password)) throw new ApiError('Netočna trenutna lozinka.', 400);
        user.password = passwordNew;
        user.passwordConfirm = passwordRepeat;


        const token = signToken(user._id);
        if (isProductionEnv()) cookie._setAttributes();


        await user.save({ validateModifiedOnly: true });
        res.status(200).cookie('jwt', token, cookie).json({
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
