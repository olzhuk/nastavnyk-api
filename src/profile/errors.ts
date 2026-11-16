import type { FieldErrors } from "../registration/errors";

export type ChangeEmailErrorCode = "INVALID_INPUT" | "EMAIL_TAKEN" | "USER_NOT_FOUND";

export const CHANGE_EMAIL_MESSAGES: Record<ChangeEmailErrorCode, string> = {
  INVALID_INPUT: "Please check the highlighted fields",
  EMAIL_TAKEN: "Email already in use",
  USER_NOT_FOUND: "User not found",
};

export class ChangeEmailError extends Error {
  constructor(
    public readonly code: ChangeEmailErrorCode,
    public readonly fields: FieldErrors = {},
  ) {
    super(CHANGE_EMAIL_MESSAGES[code]);
    this.name = "ChangeEmailError";
  }
}
