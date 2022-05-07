"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * Function convertNumberToDecimal.
 *
 * @param {number} value
 * @return {string}
 */
const convertNumberToDecimal = (value) => {
    const number = parseInt(value);
    if (isNaN(number)) {
        return;
    }
    return value.toLocaleString('en-US', {
        style: 'decimal',
        minimumFractionDigits: 0,
    });
};
exports.default = convertNumberToDecimal;
//# sourceMappingURL=convertNumberToDecimal.js.map