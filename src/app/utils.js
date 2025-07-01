const capitalize = (string) => string.charAt(0).toUpperCase() + string.slice(1);

const convertInchesToMm = (inches) => Number((inches * 25.4).toPrecision(2));

const getDateString = (date) => date.toISOString().split('T')[0];

const generateTimeSpan = (startDate, days) => {
  const endDate = new Date(startDate);
  endDate.setDate(endDate.getDate() + days);
  return [getDateString(startDate), getDateString(endDate)];
};

export { capitalize, convertInchesToMm, getDateString, generateTimeSpan };
