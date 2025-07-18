import { db } from '..';
import { eq } from 'drizzle-orm';
import { feed_follows, feeds, users } from '../schema';

export async function createFeedFollow(feed_id: string, user_id: string) {
  const [newFeedFollow] = await db.insert(feed_follows).values({ feed_id, user_id }).returning();
  const [result] = await db.select({
      id: feed_follows.id,
      createdAt: feed_follows.createdAt,
      updatedAt: feed_follows.updatedAt,
      feedName: feeds.name,
      feedUrl: feeds.url,
      userName: users.name
  }).from(feed_follows)
    .innerJoin(feeds, eq(feed_follows.feed_id, feeds.id))
    .innerJoin(users, eq(feed_follows.user_id, users.id))
    .where(eq(feed_follows.id, newFeedFollow.id)); 
  return result;
}

export async function getFeedFollowsForUser(user_id: string) {
  const result = await db.select({
    feedName: feeds.name,
    userName: users.name
  }).from(feed_follows)
    .innerJoin(feeds, eq(feed_follows.feed_id, feeds.id))
    .innerJoin(users, eq(feed_follows.user_id, users.id))
    .where(eq(feed_follows.user_id, user_id));
  return result;
}