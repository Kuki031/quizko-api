'use strict'

const path = require('path');

class Options {
    constructor(from, to, subject, html) {
        this.from = from;
        this.to = to;
        this.subject = subject;
        this.html = html;
    }

    _bindAttachments() {
        this.attachments = [
            {
                filename: 'edIT-logo.jpg',
                path: path.join(__dirname, '../public/img/edIT-logo.jpg'),
                contentType: 'image/jpg'
            },
            {
                filename: 'quizko-logo.jpg',
                path: path.join(__dirname, '../public/img/quizko-logo.jpg'),
                contentType: 'image/jpg'
            }
        ];
        return this;
    }
}
module.exports = Options;
