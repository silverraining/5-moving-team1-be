// ex) YYYY-MM-DD
export const formatDateToKst = (date: Date) =>
  new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Seoul' }).format(
    new Date(date),
  );
