/**
 * In-memory view counter for knowledge articles.
 * Shared between the main article route (which increments) and the popular
 * route (which reads). Kept out of route files because Next.js restricts
 * exports from route.ts to HTTP method handlers only.
 */

const viewCounts = new Map<string, number>();

export function trackView(articleId: string): void {
  viewCounts.set(articleId, (viewCounts.get(articleId) || 0) + 1);
}

/** Top N articles by view count */
export function getPopularArticles(n = 10): { id: string; views: number }[] {
  return [...viewCounts.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, n)
    .map(([id, views]) => ({ id, views }));
}
