export const getLocalISODateTime = () => {
  const date = new Date().toLocaleDateString('en-CA', {
    timeZone: 'Asia/Manila'
  }); // e.g., "2025-07-05"

  const time = new Date().toLocaleTimeString('en-GB', {
    hour12: false,
    timeZone: 'Asia/Manila'
  }); // e.g., "06:55:30"

  return `${date}T${time}`;
};

export function formatUTCtoLocal(utcString, options = { date: true, time: true }) {
  console.log(utcString)
  const date = new Date(utcString);

  const datePart = options.date
    ? date.toLocaleDateString('en-CA') // YYYY-MM-DD
    : '';

  const timePart = options.time
    ? date.toLocaleTimeString('en-GB', { hour12: false }) // HH:mm:ss
    : '';

  if (options.date && options.time) return `${datePart}T${timePart}`;
  if (options.date) return datePart;
  if (options.time) return timePart;
  return '';
}

export const itemHasBeenChecked = (checks, timeOfDay) => {
  const today = new Date().toLocaleDateString('en-CA');
  return checks.some(
    check =>
      new Date(check.timestamp).toLocaleDateString('en-CA') === today &&
      check.period === timeOfDay
  );
};