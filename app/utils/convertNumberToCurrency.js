"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * Function convertNumberToCurrency.
 *
 * @param {number} value
 * @return {string}
 */
const convertNumberToCurrency = (value) => {
    const number = parseInt(value);
    if (isNaN(number)) {
        return;
    }
    return value.toLocaleString('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 0,
    });
};
exports.default = convertNumberToCurrency;
//# sourceMappingURL=convertNumberToCurrency.js.map