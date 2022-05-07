import { carFees } from '../dictionaries/car/fees'

export default function calculateBidFee(bid: number) {
    const tax = (bid * (carFees.TAX_RATIO / 100)).toFixed(2)
    let feeValue = Number(tax) * 100 / 100
    feeValue = feeValue > carFees.MAX_FEE ? carFees.MAX_FEE : feeValue
    feeValue = feeValue < carFees.MIN_FEE ? carFees.MIN_FEE : feeValue
    return feeValue
}
