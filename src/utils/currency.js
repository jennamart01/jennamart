// Currency utility functions for Indonesian Rupiah formatting

/**
 * Format a number as Indonesian Rupiah currency
 * @param {number} amount - The amount to format
 * @param {boolean} showSymbol - Whether to show the Rp. symbol (default: true)
 * @returns {string} Formatted currency string
 */
export const formatRupiah = (amount, showSymbol = true) => {
  if (typeof amount !== 'number' || isNaN(amount)) {
    return showSymbol ? 'Rp. 0' : '0';
  }

  // Format number with Indonesian locale (dots for thousands, comma for decimals)
  const formatted = new Intl.NumberFormat('id-ID', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(Math.round(amount));

  return showSymbol ? `Rp. ${formatted}` : formatted;
};

/**
 * Parse a Rupiah string back to a number
 * @param {string} rupiahString - The Rupiah string to parse
 * @returns {number} The parsed number
 */
export const parseRupiah = (rupiahString) => {
  if (typeof rupiahString !== 'string') {
    return 0;
  }

  // Remove 'Rp.', spaces, and dots (thousands separators)
  const cleanString = rupiahString
    .replace(/Rp\.?\s*/g, '')
    .replace(/\./g, '')
    .replace(/,/g, '.');

  const parsed = parseFloat(cleanString);
  return isNaN(parsed) ? 0 : parsed;
};

/**
 * Format input value for Rupiah input fields
 * @param {string} value - The input value
 * @returns {string} Formatted value for display
 */
export const formatRupiahInput = (value) => {
  if (!value) return '';
  
  // Remove non-numeric characters except dots and commas
  const numericValue = value.replace(/[^\d]/g, '');
  
  if (!numericValue) return '';
  
  // Convert to number and format
  const number = parseInt(numericValue, 10);
  return formatRupiah(number, false);
};

/**
 * Validate if a string is a valid Rupiah amount
 * @param {string} value - The value to validate
 * @returns {boolean} Whether the value is valid
 */
export const isValidRupiah = (value) => {
  if (!value) return false;
  const parsed = parseRupiah(value);
  return parsed >= 0;
};

/**
 * Get the raw numeric value from a formatted Rupiah string
 * @param {string} formattedValue - The formatted Rupiah string
 * @returns {number} The raw numeric value
 */
export const getRupiahValue = (formattedValue) => {
  return parseRupiah(formattedValue);
};

/**
 * Convert USD to IDR (Indonesian Rupiah)
 * Note: In a real application, you would fetch current exchange rates
 * @param {number} usdAmount - Amount in USD
 * @param {number} exchangeRate - USD to IDR exchange rate (default: ~15000)
 * @returns {number} Amount in IDR
 */
export const convertUSDToIDR = (usdAmount, exchangeRate = 15000) => {
  return usdAmount * exchangeRate;
};

/**
 * Convert IDR to USD
 * @param {number} idrAmount - Amount in IDR
 * @param {number} exchangeRate - USD to IDR exchange rate (default: ~15000)
 * @returns {number} Amount in USD
 */
export const convertIDRToUSD = (idrAmount, exchangeRate = 15000) => {
  return idrAmount / exchangeRate;
};