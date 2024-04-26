'use strict'


module.exports = function (firstVal, secondVal) {
    let check = firstVal.find(x => x.name === secondVal.name);
    return check;
}
