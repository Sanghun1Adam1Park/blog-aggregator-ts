import { db } from '..';
import { desc, eq, sql } from 'drizzle-orm';
import { Post, feed_follows, feeds, posts } from '../schema';

export async function createPost(
  title: string, url: string,  
  published_at: Date, feed_id: string,
  description?: string) {
  const [existingPost] = await db.select().from(posts).where(eq(posts.url, url));
  if (existingPost) {
    return existingPost;
  }

  const [result] = await db.insert(posts).values({
    title: title, 
    url: url, 
    description: description, 
    publishedAt: published_at, 
    feedId: feed_id
  }).returning();
  return result;
}

export async function getPostsForUsers(userId: string, limit: number) {
  const result = await db
    .select({
      id: posts.id,
      createdAt: posts.createdAt,
      updatedAt: posts.updatedAt,
      title: posts.title,
      url: posts.url,
      description: posts.description, // Corrected from posts.description to posts.description
      publishedAt: posts.publishedAt, // Corrected from posts.publishedAt to posts.published_at
      feedId: posts.feedId, // Corrected from posts.feedId to posts.feed_id
      feedName: feeds.name,
    })
    .from(posts)
    .innerJoin(feed_follows, eq(posts.feedId, feed_follows.feedId))
    .innerJoin(feeds, eq(posts.feedId, feeds.id))
    .where(eq(feed_follows.userId, userId))
    .orderBy(desc(posts.publishedAt))
    .limit(limit);

  return result;
}