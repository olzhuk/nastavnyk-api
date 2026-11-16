import { addUserIds, LegacyUser } from "./addUserIds";

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/;

const legacy = (): LegacyUser[] => [
  { id: 1, email: "john@example.com", username: "John_Doe" },
  { id: 2, email: "olena@example.com", username: "olena_m" },
];

describe("addUserIds migration", () => {
  it("assigns a unique UUID to every record without userId", () => {
    const migrated = addUserIds(legacy());

    migrated.forEach((u) => expect(u.userId).toMatch(UUID_RE));
    expect(new Set(migrated.map((u) => u.userId)).size).toBe(migrated.length);
  });

  it("keeps an existing userId", () => {
    const records: LegacyUser[] = [{ ...legacy()[0], userId: "existing-id" }, legacy()[1]];

    const migrated = addUserIds(records, () => "generated-id");

    expect(migrated.map((u) => u.userId)).toEqual(["existing-id", "generated-id"]);
  });

  it("is idempotent", () => {
    const once = addUserIds(legacy());
    const twice = addUserIds(once, () => {
      throw new Error("must not generate for migrated records");
    });

    expect(twice).toEqual(once);
  });

  it("does not change other fields or mutate the input", () => {
    const input = legacy();
    const snapshot = structuredClone(input);

    const migrated = addUserIds(input, () => "generated-id");

    expect(input).toEqual(snapshot);
    migrated.forEach((u, i) => expect(u).toEqual({ ...snapshot[i], userId: "generated-id" }));
  });
});
