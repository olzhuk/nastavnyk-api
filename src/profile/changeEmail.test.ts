import { randomUUID } from "node:crypto";
import { changeEmail } from "./changeEmail";
import { ChangeEmailError, ChangeEmailErrorCode } from "./errors";
import { userRepository } from "../users/userRepository";

let JOHN: string;

beforeEach(() => {
  userRepository.reset();
  JOHN = userRepository.findByEmail("john@example.com")!.userId;
});

function expectError(fn: () => unknown, code: ChangeEmailErrorCode): ChangeEmailError {
  try {
    fn();
  } catch (e) {
    expect(e).toBeInstanceOf(ChangeEmailError);
    expect((e as ChangeEmailError).code).toBe(code);
    return e as ChangeEmailError;
  }
  throw new Error(`expected ChangeEmailError ${code}`);
}

const johnEmail = () => userRepository.findByUserId(JOHN)!.email;

describe("AC1: new email equals the current one", () => {
  it.each(["john@example.com", " John@Example.com "])("returns unchanged for %p", (email) => {
    const updateSpy = jest.spyOn(userRepository, "updateEmail");

    const result = changeEmail(JOHN, email);

    expect(result.status).toBe("unchanged");
    expect(result.user.email).toBe("john@example.com");
    expect(johnEmail()).toBe("john@example.com");
    expect(updateSpy).not.toHaveBeenCalled();
    updateSpy.mockRestore();
  });
});

describe("AC2: validation passes", () => {
  it("updates the email", () => {
    const result = changeEmail(JOHN, "New@Example.com");

    expect(result).toEqual({
      status: "updated",
      user: expect.objectContaining({ userId: JOHN, email: "new@example.com" }),
    });
    expect(johnEmail()).toBe("new@example.com");
    expect(userRepository.findByEmail("john@example.com")).toBeUndefined();
  });
});

describe("AC3: email belongs to another user", () => {
  it.each(["olena@example.com", "OLENA@example.com"])("rejects %p with EMAIL_TAKEN", (email) => {
    const err = expectError(() => changeEmail(JOHN, email), "EMAIL_TAKEN");

    expect(err.message).toBe("Email already in use");
    expect(johnEmail()).toBe("john@example.com");
  });
});

describe("AC4: validation fails", () => {
  it("rejects with INVALID_INPUT and field errors", () => {
    const err = expectError(() => changeEmail(JOHN, "not-an-email"), "INVALID_INPUT");

    expect(err.fields).toEqual({ email: ["must be a valid email"] });
    expect(johnEmail()).toBe("john@example.com");
  });
});

describe("AC5: user does not exist", () => {
  it("rejects with USER_NOT_FOUND", () => {
    expectError(() => changeEmail(randomUUID(), "x@example.com"), "USER_NOT_FOUND");
    expect(userRepository.findByEmail("x@example.com")).toBeUndefined();
  });
});
