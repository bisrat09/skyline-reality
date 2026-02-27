export function isValidEmail(email: string): boolean {
  if (!email) return false;
  return /^[\w.+-]+@[\w-]+\.[\w.-]+$/.test(email);
}

export function isValidPhone(phone: string): boolean {
  if (!phone) return false;
  const digits = phone.replace(/\D/g, '');
  return digits.length === 10 || (digits.length === 11 && digits.startsWith('1'));
}

export function isValidBudget(amount: number): boolean {
  return typeof amount === 'number' && amount > 0 && isFinite(amount);
}

export function isValidBudgetRange(min: number, max: number): boolean {
  return isValidBudget(min) && isValidBudget(max) && min < max;
}
