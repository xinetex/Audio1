// API Route: /api/marketplace/browse
// Browse marketplace assets with filters and search

import { neon } from '@neondatabase/serverless';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const sql = neon(process.env.DATABASE_URL);

  try {
    const {
      search = '',
      filter = 'all',
      sort = 'recent',
      limit = 20,
      offset = 0
    } = req.query;

    let query = `
      SELECT 
        a.id,
        a.name,
        a.description,
        a.image_url,
        a.thumbnail_url,
        a.width,
        a.height,
        a.source,
        a.is_premium,
        a.is_animated,
        a.price_credits,
        a.downloads,
        a.likes,
        a.ai_score,
        a.created_at,
        c.creator_id,
        c.username AS creator_name,
        COALESCE(ARRAY_AGG(t.name) FILTER (WHERE t.name IS NOT NULL), '{}') AS tags
      FROM assets a
      JOIN creators c ON a.creator_id = c.id
      LEFT JOIN asset_tags at ON a.id = at.asset_id
      LEFT JOIN tags t ON at.tag_id = t.id
      WHERE a.status = 'active'
    `;

    const params = [];
    let paramIndex = 1;

    // Apply search filter
    if (search) {
      query += ` AND (
        a.name ILIKE $${paramIndex} OR 
        a.description ILIKE $${paramIndex} OR
        EXISTS (
          SELECT 1 FROM asset_tags at2
          JOIN tags t2 ON at2.tag_id = t2.id
          WHERE at2.asset_id = a.id AND t2.name ILIKE $${paramIndex}
        )
      )`;
      params.push(`%${search}%`);
      paramIndex++;
    }

    // Apply category filter
    if (filter && filter !== 'all') {
      if (filter === 'premium') {
        query += ` AND a.is_premium = true`;
      } else if (filter === 'animated') {
        query += ` AND a.is_animated = true`;
      } else {
        // Filter by source or tag
        query += ` AND (
          a.source = $${paramIndex} OR
          EXISTS (
            SELECT 1 FROM asset_tags at3
            JOIN tags t3 ON at3.tag_id = t3.id
            WHERE at3.asset_id = a.id AND t3.name = $${paramIndex}
          )
        )`;
        params.push(filter);
        paramIndex++;
      }
    }

    query += ` GROUP BY a.id, c.id`;

    // Apply sorting
    switch (sort) {
      case 'popular':
        query += ` ORDER BY a.downloads DESC, a.likes DESC`;
        break;
      case 'trending':
        query += ` ORDER BY a.likes DESC, a.downloads DESC`;
        break;
      case 'quality':
        query += ` ORDER BY a.ai_score DESC NULLS LAST`;
        break;
      case 'recent':
      default:
        query += ` ORDER BY a.created_at DESC`;
    }

    // Apply pagination
    query += ` LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
    params.push(parseInt(limit), parseInt(offset));

    const assets = await sql(query, params);

    // Get total count for pagination
    let countQuery = `
      SELECT COUNT(DISTINCT a.id) as total
      FROM assets a
      WHERE a.status = 'active'
    `;

    const countParams = [];
    let countParamIndex = 1;

    if (search) {
      countQuery += ` AND (
        a.name ILIKE $${countParamIndex} OR 
        a.description ILIKE $${countParamIndex} OR
        EXISTS (
          SELECT 1 FROM asset_tags at
          JOIN tags t ON at.tag_id = t.id
          WHERE at.asset_id = a.id AND t.name ILIKE $${countParamIndex}
        )
      )`;
      countParams.push(`%${search}%`);
      countParamIndex++;
    }

    if (filter && filter !== 'all') {
      if (filter === 'premium') {
        countQuery += ` AND a.is_premium = true`;
      } else if (filter === 'animated') {
        countQuery += ` AND a.is_animated = true`;
      } else {
        countQuery += ` AND (
          a.source = $${countParamIndex} OR
          EXISTS (
            SELECT 1 FROM asset_tags at
            JOIN tags t ON at.tag_id = t.id
            WHERE at.asset_id = a.id AND t.name = $${countParamIndex}
          )
        )`;
        countParams.push(filter);
      }
    }

    const [{ total }] = await sql(countQuery, countParams);

    return res.status(200).json({
      assets,
      pagination: {
        total: parseInt(total),
        limit: parseInt(limit),
        offset: parseInt(offset),
        hasMore: parseInt(offset) + parseInt(limit) < parseInt(total)
      }
    });

  } catch (error) {
    console.error('Marketplace browse error:', error);
    return res.status(500).json({ error: 'Failed to fetch marketplace assets' });
  }
}
