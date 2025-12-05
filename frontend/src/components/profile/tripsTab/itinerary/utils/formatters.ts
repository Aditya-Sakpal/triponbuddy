/**
 * Utility functions for formatting dates, currency, and time in itinerary components
 */

export const formatDate = (dateString: string): string => {
  return new Date(dateString).toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric"
  });
};

export const formatCurrency = (amount: string | number): string => {
  if (typeof amount === 'string') {
    return amount.includes('₹') ? amount : `₹${amount}`;
  }
  return `₹${amount.toLocaleString()}`;
};

export const formatActivityTimeRange = (time: string, duration?: string): string => {
  if (!time) return '';

  // Parse start time - assume format like "09:00" or "9:00"
  const timeMatch = time.match(/^(\d{1,2}):(\d{2})(?:\s*(AM|PM))?$/i);
  if (!timeMatch) return time; // fallback to original time if parsing fails

  let hours = parseInt(timeMatch[1]);
  const minutes = parseInt(timeMatch[2]);
  const ampm = timeMatch[3]?.toUpperCase();

  // Convert to 24-hour format if needed
  if (ampm === 'PM' && hours !== 12) hours += 12;
  if (ampm === 'AM' && hours === 12) hours = 0;

  const startDate = new Date();
  startDate.setHours(hours, minutes, 0, 0);

  let endDate = startDate;

  // Parse duration and calculate end time
  if (duration) {
    const durationMatch = duration.match(/(\d+)\s*h(?:ours?)?(?:\s*(\d+)\s*m(?:in(?:utes?)?)?)?|(\d+)\s*m(?:in(?:utes?)?)?/i);
    if (durationMatch) {
      let addHours = 0;
      let addMinutes = 0;

      if (durationMatch[1]) { // hours and possibly minutes
        addHours = parseInt(durationMatch[1]);
        if (durationMatch[2]) addMinutes = parseInt(durationMatch[2]);
      } else if (durationMatch[3]) { // only minutes
        addMinutes = parseInt(durationMatch[3]);
      }

      endDate = new Date(startDate.getTime() + (addHours * 60 * 60 * 1000) + (addMinutes * 60 * 1000));
    }
  }

  // Format times in 12-hour format
  const formatTime12Hour = (date: Date): string => {
    const h = date.getHours();
    const m = date.getMinutes();
    const ampmSuffix = h >= 12 ? 'PM' : 'AM';
    const hour12 = h % 12 || 12;
    return `${hour12}:${m.toString().padStart(2, '0')} ${ampmSuffix}`;
  };

  const startTime = formatTime12Hour(startDate);
  const endTime = duration ? formatTime12Hour(endDate) : null;

  return endTime ? `${startTime} - ${endTime}` : startTime;
};
