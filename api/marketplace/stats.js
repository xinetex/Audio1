// API Route: /api/marketplace/stats
// Get marketplace statistics

import { neon } from '@neondatabase/serverless';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const sql = neon(process.env.DATABASE_URL);

  try {
    // Get total assets
    const [{ total_assets }] = await sql`
      SELECT COUNT(*) as total_assets
      FROM assets
      WHERE status = 'active'
    `;

    // Get total creators
    const [{ total_creators }] = await sql`
      SELECT COUNT(DISTINCT creator_id) as total_creators
      FROM creators
    `;

    // Get total downloads
    const [{ total_downloads }] = await sql`
      SELECT COALESCE(SUM(downloads), 0) as total_downloads
      FROM assets
    `;

    // Get trending tags (top 10)
    const trending_tags = await sql`
      SELECT name, usage_count
      FROM tags
      ORDER BY usage_count DESC
      LIMIT 10
    `;

    // Get top creators (by downloads)
    const top_creators = await sql`
      SELECT 
        c.creator_id,
        c.username,
        c.total_uploads,
        c.total_downloads,
        c.credits_earned
      FROM creators c
      WHERE c.total_uploads > 0
      ORDER BY c.total_downloads DESC
      LIMIT 10
    `;

    // Get recent uploads
    const recent_uploads = await sql`
      SELECT 
        a.id,
        a.name,
        a.thumbnail_url,
        a.created_at,
        c.username as creator_name
      FROM assets a
      JOIN creators c ON a.creator_id = c.id
      WHERE a.status = 'active'
      ORDER BY a.created_at DESC
      LIMIT 5
    `;

    return res.status(200).json({
      stats: {
        total_assets: parseInt(total_assets),
        total_creators: parseInt(total_creators),
        total_downloads: parseInt(total_downloads)
      },
      trending_tags,
      top_creators,
      recent_uploads
    });

  } catch (error) {
    console.error('Stats error:', error);
    return res.status(500).json({ error: 'Failed to fetch stats' });
  }
}
