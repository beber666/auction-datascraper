export const parseTimeRemaining = (timeStr: string): Date | null => {
  const str = timeStr.toLowerCase();
  let totalMinutes = 0;
  
  // Match patterns for days
  const dayMatches = str.match(/(\d+)\s*(day|jour|día|tag)/);
  if (dayMatches) {
    totalMinutes += parseInt(dayMatches[1]) * 24 * 60;
  }

  // Match patterns for hours
  const hourMatches = str.match(/(\d+)\s*(hour|heure|hora|stunde)/);
  if (hourMatches) {
    totalMinutes += parseInt(hourMatches[1]) * 60;
  }

  // Match patterns for minutes
  const minuteMatches = str.match(/(\d+)\s*(min|minute|minuto)/);
  if (minuteMatches) {
    totalMinutes += parseInt(minuteMatches[1]);
  }

  if (totalMinutes === 0) return null;

  const endTime = new Date();
  endTime.setMinutes(endTime.getMinutes() + totalMinutes);
  return endTime;
};