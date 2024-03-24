'use strict'

const dotenv = require('dotenv');
dotenv.config({ path: './config.env' });
const app = require('./app');
const connectDB = require('./utils/ConnectDB');

process.on('uncaughtException', function (e) {
    console.error(`Uncaught Exception: ${e}`);
    process.exit(1);
});


const PORT = process.env.PORT || 3000;
const HOST = process.env.HOST || 'localhost';
connectDB(process.env.MONGO_CONNECTION_STRING, process.env.MONGO_PASSWORD);



const server = app.listen(PORT, HOST, () => {
    console.log(`Application running on ${HOST}:${PORT}`);
});

process.on('unhandledRejection', function (reason) {
    server.close(() => {
        console.error(`Unhandled Rejection - Shutting down.: ${reason}`);
        process.exit(1);
    });
});

