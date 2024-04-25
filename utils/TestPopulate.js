'use strict'

const fs = require('fs');

const dotenv = require('dotenv');
dotenv.config({ path: './config.env' });

const Quiz = require('../models/Quiz');
const connectDB = require('../utils/ConnectDB');
const mongo_string = process.env.MONGO_CONNECTION_STRING;
const mongo_password = process.env.MONGO_PASSWORD;

const quizData = JSON.parse(fs.readFileSync('./dev_data/quiz.json', 'utf8'));

connectDB(mongo_string, mongo_password);


const insertData = async () => {
    try {
        await Quiz.create(quizData);
        console.log('Database populated successfully.');
    }
    catch (err) {
        console.error(err);
    }
    process.exit(1);
}

const deleteData = async () => {
    try {
        await Quiz.deleteMany({});
        console.log('Database entries deleted successfully.');
    }
    catch (err) {
        console.error(err);
    }
    process.exit(1);
}

if (process.argv[2] === '--import') insertData();
if (process.argv[2] === '--delete') deleteData();
