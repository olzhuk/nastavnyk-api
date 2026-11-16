import { ChangeEmailError } from "./errors";
import { userRepository, User } from "../users/userRepository";
import { normalizeEmail, validateEmail } from "../validation/email";

export type ChangeEmailResult =
  | { status: "unchanged"; user: User }
  | { status: "updated"; user: User };

export function changeEmail(userId: string, newEmail: string): ChangeEmailResult {
  const user = userRepository.findByUserId(userId);
  if (!user) throw new ChangeEmailError("USER_NOT_FOUND");

  const email = normalizeEmail(newEmail);
  const emailErrors = validateEmail(email);
  if (emailErrors.length) throw new ChangeEmailError("INVALID_INPUT", { email: emailErrors });

  // До перевірки на зайнятість: інакше findByEmail знайде самого користувача.
  if (email === user.email) return { status: "unchanged", user: { ...user } };

  if (userRepository.findByEmail(email)) throw new ChangeEmailError("EMAIL_TAKEN");

  return { status: "updated", user: userRepository.updateEmail(userId, email) };
}
