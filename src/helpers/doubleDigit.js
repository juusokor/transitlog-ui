const doubleDigit = (val, padEnd = false) => {
  const padded = !padEnd ? "0" + val : val + "0";
  return padded.slice(-2);
};
export default doubleDigit;
