import { db } from '..';
import { eq } from 'drizzle-orm';
import { users } from '../schema';

export async function createUser(name: string) {
  const [result] = await db.insert(users).values({ name }).returning();
  return result;
}

export async function getUser(name: string) {
  const [result] = await db.select().from(users).where(eq(users.name, name));
  return result;
}

export async function resetUsers() {
  await db.delete(users);
}

export async function getUsers() {
  const result = await db.select().from(users);
  return result;
}

export async function getUserById(id: string) {
  const [result] = await db.select().from(users).where(eq(users.id, id));
  return result;
}