'use strict'

const nodemailer = require('nodemailer');
const dotenv = require('dotenv').config({ path: './config.env' });


const transporter = nodemailer.createTransport({
    service: process.env.EMAIL_SERVICE,
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    secure: false,
    auth: {
        user: process.env.USER,
        pass: process.env.APP_PASSWORD
    },
});


const sendMail = async (transporter, mailOptions) => {
    try {
        await transporter.sendMail(mailOptions);
        console.log('E-mail uspješno poslan.');
    }
    catch (err) {
        console.error(err);
    }
}

module.exports = { transporter, sendMail };
