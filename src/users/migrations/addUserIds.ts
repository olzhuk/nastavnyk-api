import { randomUUID } from "node:crypto";
import type { User } from "../userRepository";

// Запис у форматі до появи GUID-ідентифікатора.
export type LegacyUser = Omit<User, "userId"> & { userId?: string };

// Призначає GUID `userId` кожному запису, у якого його ще немає.
// Ідемпотентна: записи з наявним `userId` не змінюються. Вхідний масив не мутується.
export function addUserIds(records: LegacyUser[], generate: () => string = randomUUID): User[] {
  return records.map((record) => ({ ...record, userId: record.userId ?? generate() }));
}
