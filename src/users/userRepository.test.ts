import { userRepository } from "./userRepository";
import { registerUser } from "../registration/registerUser";

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/;

beforeEach(() => {
  userRepository.reset();
});

describe("userRepository userId", () => {
  it("migrates seed users to unique GUIDs", () => {
    const john = userRepository.findByEmail("john@example.com")!;
    const olena = userRepository.findByEmail("olena@example.com")!;

    expect(john.userId).toMatch(UUID_RE);
    expect(olena.userId).toMatch(UUID_RE);
    expect(john.userId).not.toBe(olena.userId);
    expect(userRepository.findByUserId(john.userId)).toEqual(john);
  });

  it("gives registered users unique GUIDs", () => {
    const a = registerUser({ email: "a@example.com", username: "a", password: "s3cret-pass" });
    const b = registerUser({ email: "b@example.com", username: "b", password: "s3cret-pass" });

    expect(a.userId).toMatch(UUID_RE);
    expect(b.userId).toMatch(UUID_RE);
    expect(a.userId).not.toBe(b.userId);
  });

  it("updates email by userId", () => {
    const { userId } = userRepository.findByEmail("john@example.com")!;

    const updated = userRepository.updateEmail(userId, "new@example.com");

    expect(updated.email).toBe("new@example.com");
    expect(userRepository.findByUserId(userId)!.email).toBe("new@example.com");
  });
});
