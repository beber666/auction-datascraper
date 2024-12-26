export const parseTimeRemaining = (timeString: string): Date | null => {
  const now = new Date();
  
  // Match numbers followed by time units
  const dayMatch = timeString.match(/(\d+)\s*(day|jour|día|tag)/i);
  const hourMatch = timeString.match(/(\d+)\s*(hour|heure|hora|stunde)/i);
  const minuteMatch = timeString.match(/(\d+)\s*(min|minute|minuto)/i);

  if (!dayMatch && !hourMatch && !minuteMatch) {
    return null;
  }

  const endTime = new Date(now);

  if (dayMatch) {
    endTime.setDate(endTime.getDate() + parseInt(dayMatch[1]));
  }
  if (hourMatch) {
    endTime.setHours(endTime.getHours() + parseInt(hourMatch[1]));
  }
  if (minuteMatch) {
    endTime.setMinutes(endTime.getMinutes() + parseInt(minuteMatch[1]));
  }

  return endTime;
};