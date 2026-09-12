export const displayStatus = (status: string): string =>
  status.replace('_', ' ').replace(/\b\w/g, (letter) => letter.toUpperCase());

export const timeAgo = (date: string): string => {
  const diffMs = Date.now() - new Date(date).getTime();
  const minutes = Math.max(1, Math.round(diffMs / 60_000));
  if (minutes < 60) return `${minutes} min ago`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `${hours} hour${hours === 1 ? '' : 's'} ago`;
  return `${Math.round(hours / 24)} days ago`;
};
