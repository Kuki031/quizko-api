'use strict'

const mongoose = require('mongoose');
const uniqueValidator = require('mongoose-unique-validator');
const bcrypt = require('bcryptjs');
const validator = require('validator');

const userSchema = new mongoose.Schema({
    username: {
        type: String,
        maxLength: 30,
        required: [true, 'Morate unjeti svoje korisničko ime.'],
        trim: true,
        unique: true,
    },
    email: {
        type: String,
        required: [true, "Morate unjeti svoju e-mail adresu."],
        lowercase: true,
        validate: [validator.isEmail, 'Netočan format e-maila.'],
        trim: true,
        unique: true,
    },
    isAccountActive: {
        type: Boolean,
        default: true
    },
    password: {
        type: String,
        minLength: 8,
        required: [true, "Morate unjeti svoju lozinku."]
    },
    passwordConfirm: {
        type: String,
        required: true,
        validate: {
            validator: function (el) {
                return el === this.password;
            },
            message: "Lozinke se ne podudaraju!"
        },
        select: false
    },
    belongs_to_team: {
        type: Boolean,
        default: false
    },
    email_confirmation_token: String,
    has_confirmed_email: {
        type: Boolean,
        default: false
    },
    team: {
        type: mongoose.Schema.ObjectId,
        ref: 'Team'
    },
    role: {
        type: String,
        enum: ['Administrator', 'Moderator', 'Guest'],
        default: 'Guest'
    },
    passwordResetToken: String,
    password_token_expires_at: Date
}, {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
    timestamps: true
});
userSchema.index({ username: 1, email: 1 }, { unique: true });
userSchema.plugin(uniqueValidator);

userSchema.pre('save', async function (next) {

    if (!this.isModified('password')) return next();
    this.password = await bcrypt.hash(this.password, 12);
    this.passwordConfirm = undefined;
    next();
})


userSchema.methods.comparePw = async function (providedPw, storedPw) {
    return await bcrypt.compare(providedPw, storedPw);
}
userSchema.methods.hasCreatedTeam = (user, team) => user.id === team.created_by.toString();
userSchema.methods.hasConfirmedEmail = (user) => user.has_confirmed_email === true;

const User = mongoose.model('User', userSchema);
module.exports = User;

