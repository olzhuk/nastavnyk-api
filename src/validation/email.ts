import { matches, validate } from "./rules";
import { EMAIL_PATTERN } from "./patterns";

// Спільні правила для email: використовуються при реєстрації та зміні email.
export function normalizeEmail(raw: string): string {
  return raw.trim().toLowerCase();
}

export function validateEmail(email: string): string[] {
  return validate(email, [matches(EMAIL_PATTERN, "must be a valid email")]);
}
