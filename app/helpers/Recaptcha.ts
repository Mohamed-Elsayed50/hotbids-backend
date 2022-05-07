import http from 'https'

export default function verifyCaptcha(token: string) {
    const recaptcha = `${process.env.RECAPTCHA_LINK}?secret=${process.env.RECAPTCHA_SECRET_KEY}&response=${token}`

    return new Promise((resolve, reject) => {
        const captchaReq = http.request(recaptcha, (res) => {
            let chunks = ''
            res.setEncoding('utf8')
            res.on('data', (chunk) => {
                chunks += chunk
            })
            res.on('end', () => {
                const result = JSON.parse(chunks)
                if (result.success) {
                    resolve(true)
                } else {
                    reject()
                }

            })
        })

        captchaReq.on('error', () => {
            reject()
        })

        captchaReq.end()
    })
}