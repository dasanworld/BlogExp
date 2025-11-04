export const normalizeBusinessNumber = (number: string): string => {
  return number.replace(/[^\d]/g, '');
};

export const formatBusinessNumber = (number: string): string => {
  const normalized = normalizeBusinessNumber(number);
  if (normalized.length !== 10) {
    return normalized;
  }
  return `${normalized.slice(0, 3)}-${normalized.slice(3, 5)}-${normalized.slice(5)}`;
};

export const validateBusinessNumber = (number: string): boolean => {
  const normalized = normalizeBusinessNumber(number);
  
  if (normalized.length !== 10) {
    return false;
  }
  
  if (!/^\d{10}$/.test(normalized)) {
    return false;
  }
  
  const weights = [1, 3, 7, 1, 3, 7, 1, 3, 5];
  const nums = normalized.split('').map(Number);
  let sum = 0;
  
  for (let i = 0; i < 9; i++) {
    sum += nums[i] * weights[i];
  }
  
  sum += Math.floor((nums[8] * 5) / 10);
  const checkDigit = (10 - (sum % 10)) % 10;
  
  return checkDigit === nums[9];
};

export const isValidBusinessNumberFormat = (number: string): boolean => {
  const normalized = normalizeBusinessNumber(number);
  return /^\d{10}$/.test(normalized) && validateBusinessNumber(number);
};
