'use strict'

const express = require('express');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const helmet = require('helmet');
const sanitizer = require('perfect-express-sanitizer');
const compression = require('compression');
const hpp = require('hpp');
const ErrorController = require('./controllers/ErrorController');
const UserRouter = require('./routes/UserRoutes');
const QuizRouter = require('./routes/QuizRoutes');
const ScoreboardRouter = require('./routes/ScoreboardRoutes');
const RoundRouter = require('./routes/RoundRoutes');
const QuestionRouter = require('./routes/QuestionRoutes');
const AnswerRouter = require('./routes/AnswerRoutes');
const CategoryRouter = require('./routes/CategoryRoutes');
const PrizeRouter = require('./routes/PrizeRoutes');
const TeamRouter = require('./routes/TeamRoutes');


const app = express();

if (process.env.NODE_ENV === 'development') app.use(morgan('dev'));

app.use(helmet());
app.use(express.json({ limit: '10kb' }))
app.use(cors());
app.options('*', cors());
app.enable('trust proxy');
app.use(sanitizer.clean({
    xss: true,
    noSql: true,
    sql: true
}, [], ["like"]))
app.use(compression());
app.use(cookieParser());
app.use(express.urlencoded({
    extended: true,
    limit: '10kb'
}))
app.use(hpp({
    whitelist: ["page", "limit"]
}))


app.use('/api/v1/users', UserRouter);
app.use('/api/v1/teams', TeamRouter);
app.use('/api/v1/quizzes', QuizRouter, RoundRouter, QuestionRouter, AnswerRouter, PrizeRouter);
app.use('/api/v1/scoreboards', ScoreboardRouter);
app.use('/api/v1/categories', CategoryRouter);
app.use(ErrorController);

module.exports = app;
