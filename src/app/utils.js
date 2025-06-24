const capitalize = (string) => string.charAt(0).toUpperCase() + string.slice(1);

const convertInchesToMm = (inches) => Number((inches * 25.4).toPrecision(2));

export { capitalize, convertInchesToMm };
