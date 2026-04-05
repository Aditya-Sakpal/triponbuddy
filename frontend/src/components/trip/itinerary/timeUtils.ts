export const formatActivityTimeRange = (time: string, duration?: string): string => {
  if (!time) return "";

  const timeMatch = time.match(/^(\d{1,2}):(\d{2})(?:\s*(AM|PM))?$/i);
  if (!timeMatch) return time;

  let hours = Number.parseInt(timeMatch[1], 10);
  const minutes = Number.parseInt(timeMatch[2], 10);
  const ampm = timeMatch[3]?.toUpperCase();

  if (ampm === "PM" && hours !== 12) hours += 12;
  if (ampm === "AM" && hours === 12) hours = 0;

  const startDate = new Date();
  startDate.setHours(hours, minutes, 0, 0);
  let endDate = startDate;

  if (duration) {
    const durationMatch = duration.match(
      /(\d+)\s*h(?:ours?)?(?:\s*(\d+)\s*m(?:in(?:utes?)?)?)?|(\d+)\s*m(?:in(?:utes?)?)?/i
    );
    if (durationMatch) {
      let addHours = 0;
      let addMinutes = 0;
      if (durationMatch[1]) {
        addHours = Number.parseInt(durationMatch[1], 10);
        if (durationMatch[2]) addMinutes = Number.parseInt(durationMatch[2], 10);
      } else if (durationMatch[3]) {
        addMinutes = Number.parseInt(durationMatch[3], 10);
      }
      endDate = new Date(startDate.getTime() + (addHours * 60 + addMinutes) * 60 * 1000);
    }
  }

  const format12Hour = (date: Date): string => {
    const h = date.getHours();
    const m = date.getMinutes();
    const suffix = h >= 12 ? "PM" : "AM";
    const hour12 = h % 12 || 12;
    return `${hour12}:${m.toString().padStart(2, "0")} ${suffix}`;
  };

  const startTime = format12Hour(startDate);
  const endTime = duration ? format12Hour(endDate) : null;
  return endTime ? `${startTime} - ${endTime}` : startTime;
};
