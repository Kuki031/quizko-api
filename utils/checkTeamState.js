'use strict'

module.exports = async function (model, query, condition) {
    const user = await model.findById(query);
    return user.belongs_to_team === condition;
}
