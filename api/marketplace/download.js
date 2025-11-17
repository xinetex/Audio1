// API Route: /api/marketplace/download
// Track asset download and update stats

import { neon } from '@neondatabase/serverless';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const sql = neon(process.env.DATABASE_URL);

  try {
    const { asset_id, user_id = 'anonymous' } = req.body;

    if (!asset_id) {
      return res.status(400).json({ error: 'Missing asset_id' });
    }

    // Get IP and user agent
    const ip_address = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
    const user_agent = req.headers['user-agent'];

    // 1. Record download
    await sql`
      INSERT INTO downloads (asset_id, user_id, ip_address, user_agent)
      VALUES (${asset_id}, ${user_id}, ${ip_address}, ${user_agent})
    `;

    // 2. Increment asset download count
    await sql`
      UPDATE assets
      SET downloads = downloads + 1
      WHERE id = ${asset_id}
    `;

    // 3. Update creator stats
    await sql`
      UPDATE creators
      SET total_downloads = total_downloads + 1
      WHERE id = (SELECT creator_id FROM assets WHERE id = ${asset_id})
    `;

    // 4. If premium, award credits to creator
    const asset = await sql`
      SELECT is_premium, price_credits, creator_id
      FROM assets
      WHERE id = ${asset_id}
    `;

    if (asset[0].is_premium && asset[0].price_credits > 0) {
      await sql`
        UPDATE creators
        SET credits_earned = credits_earned + ${asset[0].price_credits}
        WHERE id = ${asset[0].creator_id}
      `;
    }

    return res.status(200).json({ success: true });

  } catch (error) {
    console.error('Download tracking error:', error);
    return res.status(500).json({ error: 'Failed to track download' });
  }
}
