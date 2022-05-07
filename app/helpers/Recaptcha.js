"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const https_1 = __importDefault(require("https"));
function verifyCaptcha(token) {
    const recaptcha = `${process.env.RECAPTCHA_LINK}?secret=${process.env.RECAPTCHA_SECRET_KEY}&response=${token}`;
    return new Promise((resolve, reject) => {
        const captchaReq = https_1.default.request(recaptcha, (res) => {
            let chunks = '';
            res.setEncoding('utf8');
            res.on('data', (chunk) => {
                chunks += chunk;
            });
            res.on('end', () => {
                const result = JSON.parse(chunks);
                if (result.success) {
                    resolve(true);
                }
                else {
                    reject();
                }
            });
        });
        captchaReq.on('error', () => {
            reject();
        });
        captchaReq.end();
    });
}
exports.default = verifyCaptcha;
//# sourceMappingURL=Recaptcha.js.map