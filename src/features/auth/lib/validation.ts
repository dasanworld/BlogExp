export const validateName = (name: string): string | null => {
  if (!name) return '이름을 입력해주세요';
  if (name.length < 2) return '이름은 2자 이상이어야 합니다';
  if (name.length > 100) return '이름은 100자 이하여야 합니다';
  if (!/^[가-힣a-zA-Z\s]+$/.test(name)) return '이름은 한글 또는 영문만 가능합니다';
  return null;
};

export const validatePhone = (phone: string): string | null => {
  if (!phone) return '휴대폰번호를 입력해주세요';
  const normalized = phone.replace(/-/g, '');
  if (!/^010\d{7,8}$/.test(normalized)) return '올바른 휴대폰 번호 형식이 아닙니다';
  return null;
};

export const validateEmail = (email: string): string | null => {
  if (!email) return '이메일을 입력해주세요';
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return '올바른 이메일 형식이 아닙니다';
  return null;
};

export const validatePassword = (password: string): string | null => {
  if (!password) return '비밀번호를 입력해주세요';
  if (password.length < 8) return '비밀번호는 8자 이상이어야 합니다';
  
  const hasLetter = /[a-zA-Z]/.test(password);
  const hasNumber = /\d/.test(password);
  const hasSpecial = /[!@#$%^&*]/.test(password);
  
  const combinationCount = [hasLetter, hasNumber, hasSpecial].filter(Boolean).length;
  if (combinationCount < 2) {
    return '비밀번호는 영문, 숫자, 특수문자 중 2가지 이상 조합이어야 합니다';
  }
  
  return null;
};

export const validatePasswordMatch = (password: string, confirmPassword: string): string | null => {
  if (password !== confirmPassword) return '비밀번호가 일치하지 않습니다';
  return null;
};

export const normalizePhone = (phone: string): string => {
  return phone.replace(/-/g, '');
};

export const formatPhoneInput = (value: string): string => {
  const numbers = value.replace(/\D/g, '');
  if (numbers.length <= 3) return numbers;
  if (numbers.length <= 7) return `${numbers.slice(0, 3)}-${numbers.slice(3)}`;
  return `${numbers.slice(0, 3)}-${numbers.slice(3, 7)}-${numbers.slice(7, 11)}`;
};
