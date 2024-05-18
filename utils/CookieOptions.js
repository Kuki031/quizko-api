'use strict'

require('dotenv').config({ path: './config.env' });

class Cookie {
    constructor(expires, httpOnly) {
        this.expires = expires;
        this.httpOnly = httpOnly;
    }

    _setAttributes() {
        this.expires = new Date(Date.now() + process.env.COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000);
        this.httpOnly = true;
        return this;
    }
}
module.exports = Cookie;
