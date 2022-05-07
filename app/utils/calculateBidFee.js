"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const fees_1 = require("../dictionaries/car/fees");
function calculateBidFee(bid) {
    const tax = (bid * (fees_1.carFees.TAX_RATIO / 100)).toFixed(2);
    let feeValue = Number(tax) * 100 / 100;
    feeValue = feeValue > fees_1.carFees.MAX_FEE ? fees_1.carFees.MAX_FEE : feeValue;
    feeValue = feeValue < fees_1.carFees.MIN_FEE ? fees_1.carFees.MIN_FEE : feeValue;
    return feeValue;
}
exports.default = calculateBidFee;
//# sourceMappingURL=calculateBidFee.js.map