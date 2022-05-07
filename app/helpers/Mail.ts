const mailer = require('@sendgrid/mail')

export class Mail {

    static from = '';

    static init(apiKey: string, from: string) {
        mailer.setApiKey(apiKey)
        Mail.from = from;
    }

    static send(to, subject, text = '', isHtml = false, from = null) {
        if (from == null) { // @ts-ignore
            from = Mail.from
        }
        const msg = {
            to: to,
            from: from,
            subject: subject
        }

        msg[isHtml ? 'html' : 'text'] = text

        mailer.send(msg)
            .then(() => {
            })
            .catch((error) => {
                console.log(error)

                if (error.response) {
                    console.error(error.response.body)
                }
            })
    }

}
