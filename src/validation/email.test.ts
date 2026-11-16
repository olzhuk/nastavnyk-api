import { normalizeEmail, validateEmail } from "./email";

describe("normalizeEmail", () => {
  it("trims whitespace and lowercases", () => {
    expect(normalizeEmail("  John@Example.COM ")).toBe("john@example.com");
  });
});

describe("validateEmail", () => {
  it("accepts a valid email", () => {
    expect(validateEmail("john@example.com")).toEqual([]);
  });

  it.each(["not-an-email", "john@example", "@example.com", "jo hn@example.com", ""])(
    "rejects %p",
    (email) => {
      expect(validateEmail(email)).toEqual(["must be a valid email"]);
    },
  );
});
