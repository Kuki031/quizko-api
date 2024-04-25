'use strict'

module.exports = function (reqPage, reqLimit) {
    const page = parseInt(reqPage) || 1;
    const limit = parseInt(reqLimit) || 10;
    const skip = (page - 1) * limit;

    return { page, limit, skip }
}
