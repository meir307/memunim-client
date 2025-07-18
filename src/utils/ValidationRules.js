export const required = v => !!v || 'שדה חובה';
export const email = v => /.+@.+\..+/.test(v) || 'אימייל לא תקין';

export const minLength = min => v => (v && v.length >= min) || `לפחות ${min} תווים`;
export const hasNumber = v => /\d/.test(v) || 'הסיסמה חייבת להכיל לפחות ספרה אחת';
export const hasLetter = v => /[a-zA-Z]/.test(v) || 'הסיסמה חייבת להכיל לפחות אות אחת באנגלית';

export const fullNameHebrewPattern = v => /^[א-ת'" ]+$/.test(v) || 'השם חייב להכיל רק אותיות בעברית, גרש וגרשיים ורווחים';
export const fullNameHebrewWords = v => {
  if (!v) return 'יש להזין שם מלא';
  const words = v.trim().split(/\s+/);
  if (words.length < 2) return 'יש להזין לפחות שתי מילים';
  if (!words.every(word => word.length >= 2)) return 'כל מילה חייבת להכיל לפחות שתי אותיות';
  return true;
};

export const fullNameRules = [
  required,
  fullNameHebrewPattern,
  fullNameHebrewWords
];

export const phoneDigits = v => /^\d+$/.test(v) || 'הטלפון חייב להכיל ספרות בלבד';
export const phoneLength = v => (v && (v.length === 9 || v.length === 10)) || 'מספר טלפון לא תקין';

export const phoneRules = [
  required,
  phoneDigits,
  phoneLength
];

export const passwordRules = [
  required,
  minLength(6),
  hasNumber,
  hasLetter
];

export const emailRules = [required, email];
