// Date display. Dates are stored as ISO strings (YYYY-MM-DD) and shown as
// "2 March 2026". Parsing by hand avoids time zone shifts that `new Date()`
// can cause on ISO dates.

const MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

export function formatDate(iso: string, short = false): string {
  const [year, month, day] = iso.split("-").map(Number);
  const name = MONTHS[month - 1];
  return short ? `${day} ${name.slice(0, 3)}` : `${day} ${name} ${year}`;
}
