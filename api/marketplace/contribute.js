// API Route: /api/marketplace/contribute
// Upload asset to marketplace

import { neon } from '@neondatabase/serverless';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const sql = neon(process.env.DATABASE_URL);

  try {
    const {
      creator_id,
      name,
      description,
      image_url,
      thumbnail_url,
      width,
      height,
      file_size,
      source,
      is_premium = false,
      is_animated = false,
      price_credits = 0,
      ai_score,
      tags = [],
      metadata = {}
    } = req.body;

    // Validation
    if (!creator_id || !name || !image_url) {
      return res.status(400).json({ 
        error: 'Missing required fields: creator_id, name, image_url' 
      });
    }

    // Start transaction
    // 1. Get or create creator
    let creator = await sql`
      SELECT id FROM creators WHERE creator_id = ${creator_id}
    `;

    if (creator.length === 0) {
      creator = await sql`
        INSERT INTO creators (creator_id, username)
        VALUES (${creator_id}, ${creator_id.slice(0, 8)})
        RETURNING id
      `;
    }

    const creatorDbId = creator[0].id;

    // 2. Insert asset
    const asset = await sql`
      INSERT INTO assets (
        creator_id,
        name,
        description,
        image_url,
        thumbnail_url,
        width,
        height,
        file_size,
        source,
        is_premium,
        is_animated,
        price_credits,
        ai_score,
        metadata,
        status
      ) VALUES (
        ${creatorDbId},
        ${name},
        ${description || null},
        ${image_url},
        ${thumbnail_url || image_url},
        ${width || null},
        ${height || null},
        ${file_size || null},
        ${source || 'manual'},
        ${is_premium},
        ${is_animated},
        ${price_credits},
        ${ai_score || null},
        ${JSON.stringify(metadata)},
        'active'
      )
      RETURNING id, created_at
    `;

    const assetId = asset[0].id;

    // 3. Process tags
    if (tags && tags.length > 0) {
      for (const tagName of tags) {
        const cleanTag = tagName.trim().toLowerCase();
        if (!cleanTag) continue;

        // Get or create tag
        let tag = await sql`
          SELECT id FROM tags WHERE name = ${cleanTag}
        `;

        if (tag.length === 0) {
          tag = await sql`
            INSERT INTO tags (name, usage_count)
            VALUES (${cleanTag}, 1)
            RETURNING id
          `;
        } else {
          await sql`
            UPDATE tags 
            SET usage_count = usage_count + 1
            WHERE id = ${tag[0].id}
          `;
        }

        // Link tag to asset
        await sql`
          INSERT INTO asset_tags (asset_id, tag_id)
          VALUES (${assetId}, ${tag[0].id})
          ON CONFLICT DO NOTHING
        `;
      }
    }

    // 4. Update creator stats
    await sql`
      UPDATE creators
      SET 
        total_uploads = total_uploads + 1,
        updated_at = NOW()
      WHERE id = ${creatorDbId}
    `;

    return res.status(201).json({
      success: true,
      asset: {
        id: assetId,
        name,
        created_at: asset[0].created_at
      }
    });

  } catch (error) {
    console.error('Contribute error:', error);
    return res.status(500).json({ 
      error: 'Failed to contribute asset',
      details: error.message 
    });
  }
}
