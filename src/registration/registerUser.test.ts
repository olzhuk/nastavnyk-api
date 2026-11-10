import { registerUser, RegisterInput } from "./registerUser";
import { RegistrationError } from "./errors";
import { userRepository } from "../users/userRepository";

function catchError(input: RegisterInput): RegistrationError {
  try {
    registerUser(input);
  } catch (error) {
    if (error instanceof RegistrationError) return error;
    throw error;
  }
  throw new Error("Expected registerUser to throw");
}

const validInput = {
  email: "new.user@example.com",
  username: "new_user",
  password: "s3cret-pass",
};

beforeEach(() => {
  userRepository.reset();
});

describe("registerUser", () => {
  it("registers a user with valid data", () => {
    const user = registerUser(validInput);

    expect(user).toMatchObject({ email: "new.user@example.com" });
    expect(userRepository.findByEmail("new.user@example.com")).toBeDefined();
  });

  it("rejects an invalid email", () => {
    expect(() => registerUser({ ...validInput, email: "not-an-email" })).toThrow(
      "Please check the highlighted fields",
    );
  });

  it("rejects a password shorter than 8 characters", () => {
    expect(() => registerUser({ ...validInput, password: "short" })).toThrow(
      "Please check the highlighted fields",
    );
  });

  it("rejects an email that is already registered", () => {
    expect(() => registerUser({ ...validInput, email: "John@Example.com" })).toThrow(
      "Email already registered",
    );
  });

  describe("username", () => {
    it.each(["abc", "a".repeat(20)])("accepts a username of boundary length: %s", (username) => {
      expect(registerUser({ ...validInput, username })).toMatchObject({ username });
    });

    it.each(["ab", "a".repeat(21)])("rejects a username of invalid length: %s", (username) => {
      const error = catchError({ ...validInput, username });

      expect(error.code).toBe("INVALID_INPUT");
      expect(error.fields.username).toContain("must be between 3 and 20 characters");
    });

    it.each(["new-user", "new user", "нов_юзер", "new.user"])(
      "rejects a username with disallowed characters: %s",
      (username) => {
        const error = catchError({ ...validInput, username });

        expect(error.code).toBe("INVALID_INPUT");
        expect(error.fields.username).toContain(
          "may contain only Latin letters, digits and underscore",
        );
      },
    );

    it.each(["john_doe", "JOHN_DOE", "John_Doe"])(
      "rejects a username taken in any letter case: %s",
      (username) => {
        const error = catchError({ ...validInput, username });

        expect(error.code).toBe("USERNAME_TAKEN");
        expect(error.message).toBe("Username already taken");
      },
    );

    it("rejects a username matching a legacy record stored with surrounding spaces", () => {
      userRepository.create({ email: "legacy@example.com", username: "  Legacy_User " });

      expect(catchError({ ...validInput, username: "legacy_user" }).code).toBe("USERNAME_TAKEN");
    });

    it("stores the username in the letter case it was entered", () => {
      registerUser({ ...validInput, username: "New_User" });

      expect(userRepository.findByUsername("new_user")?.username).toBe("New_User");
    });

    it("trims surrounding spaces before validating and storing", () => {
      const user = registerUser({ ...validInput, username: "  new_user  " });

      expect(user.username).toBe("new_user");
    });

    it("reports EMAIL_TAKEN first when both email and username are taken", () => {
      const error = catchError({ ...validInput, email: "john@example.com", username: "john_doe" });

      expect(error.code).toBe("EMAIL_TAKEN");
    });
  });
});
