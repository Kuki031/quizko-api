'use strict'

const Quiz = require('../models/Quiz');
const ApiError = require('../utils/ApiError');


module.exports = function ([...params], [...queryParam]) {

    return async function (req, res, next) {
        let constructParam = req.params[params];
        let constructQuery;
        if (queryParam.length > 1) {
            constructQuery = { [queryParam]: constructParam };
        } else {
            constructQuery = { [queryParam]: constructParam };
        }
        try {
            const quiz = await Quiz.findOne(constructQuery);
            if (!quiz) return next(new ApiError("Traženi resurs ne postoji.", 404));
            if (quiz.created_by.toString() !== req.user.id) return next(new ApiError("Niste kreirali ovaj kviz, ne možete uređivati kviz.", 403));

            next();
        } catch (err) {
            return next(err);
        }
    };
};
