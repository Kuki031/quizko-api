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
    isInTeam: {
        type: Boolean,
        default: false
    },
    isCurrentlyInQuiz: {
        type: Boolean,
        default: false
    },
    role: {
        type: String,
        enum: ['Administrator', 'Moderator', 'Guest'],
        default: 'Guest'
    },
    saved_quizzes: [
        {
            type: mongoose.Schema.ObjectId,
            ref: 'Quiz'
        }
    ],
    createdAt: Date,
    updatedAt: Date
}, {
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
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




const User = mongoose.model('User', userSchema);
module.exports = User;

