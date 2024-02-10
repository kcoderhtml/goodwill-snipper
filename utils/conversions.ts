export function convertTimeToSeconds(remainingTime: string): number {
  const timeRegex = /(?:(\d+)d)?\s*(?:(\d+)h)?\s*(?:(\d+)m)?\s*(?:(\d+)s)?/;
  const match = remainingTime.match(timeRegex);

  if (!match) {
    console.error("Invalid time format");
    return 0;
  }

  const days = match[1] ? parseInt(match[1], 10) : 0;
  const hours = match[2] ? parseInt(match[2], 10) : 0;
  const minutes = match[3] ? parseInt(match[3], 10) : 0;
  const seconds = match[4] ? parseInt(match[4], 10) : 0;

  return days * 86400 + hours * 3600 + minutes * 60 + seconds;
}
