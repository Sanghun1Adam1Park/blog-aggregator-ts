import { db } from '..';
import { eq, sql } from 'drizzle-orm';
import { Feed, feeds } from '../schema';

export async function createFeed(name: string, url: string, user_id: string) {
  const [result] = await db.insert(feeds).values({ name, url, user_id }).returning();
  return result;
}

export async function getFeedByUrl(url: string) {
  const [result] = await db.select().from(feeds).where(eq(feeds.url, url));
  return result;
}

export async function getFeeds() {
  const result = await db.select().from(feeds);
  return result;
}

export async function markFeedFetched(feed_id: string) {
  const [result] = await db.update(feeds).set({ 
    last_fetched_at: new Date(), updatedAt: new Date() 
  }).where(eq(feeds.id, feed_id)).returning();
  return result;
}

export async function getNextFeedToFetch() {
  const [result] = await db.execute(sql`SELECT * FROM feeds ORDER BY last_fetched_at DESC LIMIT 1`);
  return result as Feed; 
} 