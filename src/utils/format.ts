export function formatPrice(price: number): string {
  if (price >= 1_000_000_000) {
    return `\u20A6${(price / 1_000_000_000).toFixed(1)}B`;
  }
  if (price >= 1_000_000) {
    return `\u20A6${(price / 1_000_000).toFixed(1)}M`;
  }
  if (price >= 1_000) {
    return `\u20A6${(price / 1_000).toFixed(0)}K`;
  }
  return `\u20A6${price.toLocaleString()}`;
}

export function formatFullPrice(price: number): string {
  return `\u20A6${price.toLocaleString()}`;
}

export function formatSize(size: number, unit: string): string {
  return `${size} ${unit}`;
}

export function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-NG', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

export function getTimeAgo(dateString: string): string {
  const now = new Date();
  const date = new Date(dateString);
  const diff = now.getTime() - date.getTime();
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));

  if (days === 0) return 'Today';
  if (days === 1) return 'Yesterday';
  if (days < 7) return `${days} days ago`;
  if (days < 30) return `${Math.floor(days / 7)} weeks ago`;
  if (days < 365) return `${Math.floor(days / 30)} months ago`;
  return `${Math.floor(days / 365)} years ago`;
}

export function getCategoryLabel(category: string): string {
  switch (category) {
    case 'lease':
      return 'For Lease';
    case 'sale':
      return 'For Sale';
    case 'distress':
      return 'Distress Sale';
    default:
      return category;
  }
}
