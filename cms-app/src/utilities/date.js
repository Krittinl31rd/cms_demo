const now = new Date();

export const getDateNow = () => {
  const name = now.toLocaleDateString("en-US", {
    weekday: "long",
  });
  const day = now.toLocaleDateString("en-US", {
    day: "numeric",
  });
  const month = now.toLocaleDateString("en-US", {
    month: "long",
  });

  return `${name} ${day} ${month}`;
};

export const toUTCStringAuto = (localDate) => {
  if (!(localDate instanceof Date)) {
    throw new Error("Invalid date");
  }

  return localDate.toISOString().replace("T", " ").substring(0, 19);
};
