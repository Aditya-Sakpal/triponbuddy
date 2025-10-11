export const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric"
  });
};

export const formatTitleCase = (text: string): string => {
  if (!text) return '';

  // Replace underscores with spaces and capitalize each word
  return text
    .split('_')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
};

/**
 * Sanitizes price strings to extract only the numeric price range
 * Example: "₹300 - ₹1,00,000+ (Covers local transport...)" -> "₹300 - ₹1,00,000+"
 */
export const sanitizePrice = (priceString: string): string => {
  if (!priceString) return '';

  // Match pattern: ₹ followed by numbers and commas, optionally with +, possibly a range
  const match = priceString.match(/₹[\d,]+\+?(?:\s*-\s*₹[\d,]+\+?)?/);
  return match ? match[0].trim() : priceString;
};
