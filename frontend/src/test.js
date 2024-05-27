const generateDpsArray = (price) => {
  const dps = [];
  for (let i = 0; i < 10; i++) {
    let yValue;
    if (i < 3) {
      yValue = price + 100 * (3 - i);
    } else if (i === 3) {
      yValue = price;
    } else {
      yValue = price - 100 * (i - 3);
    }
    dps.push({ x: i + 1, y: yValue });
  }
  return dps;
};

// Example usage
const price = 500;
const dataPoints = generateDpsArray(price);
console.log(dataPoints);
