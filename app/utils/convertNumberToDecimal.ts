/**
 * Function convertNumberToDecimal.
 *
 * @param {number} value
 * @return {string}
 */
const convertNumberToDecimal = (value) => {
  const number = parseInt(value)

  if (isNaN(number)) {
    return
  }

  return value.toLocaleString('en-US', {
    style: 'decimal',
    minimumFractionDigits: 0,
  })
}

export default convertNumberToDecimal
