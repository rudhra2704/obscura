// Normalize a date to midnight UTC so we compare by calendar day only
const startOfDayUTC = (dateInput) => {
  const date = new Date(dateInput);
  if (Number.isNaN(date.getTime())) {
    return null;
  }
  return new Date(
    Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate())
  );
};

const isValidDate = (dateInput) => {
  const date = new Date(dateInput);
  return !Number.isNaN(date.getTime());
};

const isPastDate = (dateInput) => {
  const day = startOfDayUTC(dateInput);
  const today = startOfDayUTC(new Date());
  if (!day || !today) {
    return true;
  }
  return day.getTime() < today.getTime();
};

module.exports = {
  startOfDayUTC,
  isValidDate,
  isPastDate,
};
