export const calculateAge = (birthDate: Date | string): number => {
  const birth = typeof birthDate === 'string' ? new Date(birthDate) : birthDate;
  const today = new Date();
  
  let age = today.getFullYear() - birth.getFullYear();
  const monthDiff = today.getMonth() - birth.getMonth();
  
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age--;
  }
  
  return age;
};

export const isAtLeast14YearsOld = (birthDate: Date | string): boolean => {
  return calculateAge(birthDate) >= 14;
};

export const formatDateToString = (date: Date): string => {
  return date.toISOString().split('T')[0];
};

export const parseDateString = (dateString: string): Date => {
  return new Date(dateString);
};

export const isValidDate = (dateString: string): boolean => {
  const date = new Date(dateString);
  return date instanceof Date && !isNaN(date.getTime());
};

export const isFutureDate = (dateString: string): boolean => {
  const date = new Date(dateString);
  return date > new Date();
};

export const isPastDate = (dateString: string): boolean => {
  const date = new Date(dateString);
  return date < new Date();
};
