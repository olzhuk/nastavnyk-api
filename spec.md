API: `changeEmail(userId: string, newEmail: string): ChangeEmailResult` (`src/profile/changeEmail.ts`).
HTTP-шару в сервісі немає; результати та помилки повертає функція. Помилки мають тип `ChangeEmailError` з полем `code`.
Користувач ідентифікується за GUID `userId`.

Given Користувач змінює email у профілі 
When новий email збігається з поточним (після нормалізації: trim + lowercase)
Then API повертає `{ status: "unchanged", user }`
And email користувача залишається не зміненим

Given Користувач змінює email у профілі і застосовуються стандартні правила валідації, як під час реєстрації
When перевірка пройшла
Then API повертає `{ status: "updated", user }`
And email в профілі змінюється

Given Користувач змінює email у профілі 
When новий email належить іншому користувачу
Then API кидає `ChangeEmailError` з кодом `EMAIL_TAKEN`
And email залишається не зміненим.

Given Користувач змінює email у профілі і застосовуються стандартні правила валідації, як під час реєстрації
When перевірка не пройшла
Then API кидає `ChangeEmailError` з кодом `INVALID_INPUT` і помилками в `fields.email`
And email користувача залишається не зміненим

Given Користувач змінює email у профілі
When користувача з таким `userId` не існує
Then API кидає `ChangeEmailError` з кодом `USER_NOT_FOUND`
And жодні дані не змінюються

Non-goals:
- не змінювати правила валідації при реєстрації, дописувати нові для зміни якщо необхідно
- не змінювати API реєстрації користувачів
