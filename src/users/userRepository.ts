import { randomUUID } from "node:crypto";
import { addUserIds, LegacyUser } from "./migrations/addUserIds";

export interface User {
  id: number;
  // Надійний унікальний ідентифікатор (GUID). Використовуйте його замість `id`.
  userId: string;
  email: string;
  username: string;
}

// Наявні записи в старому форматі, без `userId`. GUID призначає міграція addUserIds.
const SEED_USERS: LegacyUser[] = [
  { id: 1, email: "john@example.com", username: "John_Doe" },
  { id: 2, email: "olena@example.com", username: "olena_m" },
];

let users: User[] = [];

export const userRepository = {
  findByEmail(email: string): User | undefined {
    return users.find((u) => u.email === email);
  },

  findByUsername(username: string): User | undefined {
    return users.find((u) => u.username === username);
  },

  findByUserId(userId: string): User | undefined {
    return users.find((u) => u.userId === userId);
  },

  create(data: Omit<User, "id" | "userId">): User {
    const user: User = { id: users.length + 1, userId: randomUUID(), ...data };
    users.push(user);
    return user;
  },

  updateEmail(userId: string, email: string): User {
    const user = users.find((u) => u.userId === userId);
    if (!user) throw new Error(`User ${userId} not found`);
    user.email = email;
    return { ...user };
  },

  // Повертає сховище до початкових даних (з міграцією). Використовується в тестах.
  reset(): void {
    users = addUserIds(SEED_USERS.map((u) => ({ ...u })));
  },
};

userRepository.reset();
