// 사업자등록번호 유틸 함수 모음

// 숫자만 남기기
export const normalizeBusinessNumber = (value: string): string => {
  return (value || '').replace(/\D/g, '').slice(0, 10);
};

// 표시용 하이픈 추가 (XXX-XX-XXXXX)
export const formatBusinessNumber = (value: string): string => {
  const digits = normalizeBusinessNumber(value);
  const part1 = digits.slice(0, 3);
  const part2 = digits.slice(3, 5);
  const part3 = digits.slice(5, 10);
  if (!part2) return part1;
  if (!part3) return `${part1}-${part2}`;
  return `${part1}-${part2}-${part3}`;
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
