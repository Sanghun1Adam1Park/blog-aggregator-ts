import { db } from '..';
import { and, eq } from 'drizzle-orm';
import { Feed, feed_follows, feeds, users } from '../schema';

export async function createFeedFollow(feed_id: string, user_id: string) {
  const [newFeedFollow] = await db.insert(feed_follows).values({ feedId: feed_id, userId:user_id }).returning();
  const [result] = await db.select({
      id: feed_follows.id,
      createdAt: feed_follows.createdAt,
      updatedAt: feed_follows.updatedAt,
      feedName: feeds.name,
      feedUrl: feeds.url,
      userName: users.name
  }).from(feed_follows)
    .innerJoin(feeds, eq(feed_follows.feedId, feeds.id))
    .innerJoin(users, eq(feed_follows.userId, users.id))
    .where(eq(feed_follows.id, newFeedFollow.id)); 
  return result;
}

export async function getFeedFollowsForUser(user_id: string) {
  const result = await db.select({
    feedName: feeds.name,
    userName: users.name
  }).from(feed_follows)
    .innerJoin(feeds, eq(feed_follows.feedId, feeds.id))
    .innerJoin(users, eq(feed_follows.userId, users.id))
    .where(eq(feed_follows.userId, user_id));
  return result;
}

export async function deleteFeedFlollow(user_id: string, feed_id: string) {
  const [result] = await db.delete(feed_follows)
    .where(and(eq(feed_follows.userId, user_id), eq(feed_follows.feedId, feed_id))).returning();
  return result;
}

