'use strict'

class Template {

    constructor(username) {
        this.username = username || '';
    }

    _setTemplate(template) {
        switch (template) {
            case "welcome":
                this.heading = `Dobrodošli u Quizko aplikaciju, ${this.username}`;
                this.content = `
                Kako bi ste mogli dalje koristiti aplikaciju, morate potvrditi svoju e-mail adresu.
                Nakon potvrde e-maila, možete koristiti sve značajke aplikacije.
                `;
                this.anchor = `Potvrdi e-mail adresu`;
                break;
            case "resend":
                this.heading = `Promjena e-mail adrese za račun "${this.username}"`
                this.content = `
                Kako bi ste mogli dalje koristiti aplikaciju, morate potvrditi svoju novu e-mail adresu.
                Nakon potvrde nove e-mail adrese, možete dalje koristiti sve značajke aplikacije.
                `
                this.anchor = `Potvrdi e-mail adresu`
                break;
            case "forgot-password":
                this.heading = `E-mail za oporavak lozinke`
                this.content = `
                Kako bi ste bili preusmjereni na stranicu za oporavak lozinke,
                potrebno je kliknuti na sljedeći link:
                `
                this.anchor = `Oporavi lozinku`
                break;
            default: 0
                break;
        }
        return this;
    }

    _setCredentials(creds) {
        this.locals = { ...creds };
        return this;
    }

    _prepareForCompileFunction() {
        this.htmlContent = {
            heading: this.heading,
            content: this.content,
            anchor: this.anchor
        }
        this.mergeProps = Object.assign(this.htmlContent, this.locals);
        return this.mergeProps;
    }
}


module.exports = Template;