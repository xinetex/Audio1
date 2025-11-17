-- AUDIO1.TV MARKETPLACE DATABASE SCHEMA
-- For Neon PostgreSQL

-- Creators table
CREATE TABLE creators (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    creator_id TEXT UNIQUE NOT NULL, -- Midjourney ID or user ID
    username TEXT,
    email TEXT,
    avatar_url TEXT,
    bio TEXT,
    total_uploads INTEGER DEFAULT 0,
    total_downloads INTEGER DEFAULT 0,
    credits_earned INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Assets table
CREATE TABLE assets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    creator_id UUID REFERENCES creators(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    image_url TEXT NOT NULL,
    thumbnail_url TEXT,
    width INTEGER,
    height INTEGER,
    file_size INTEGER,
    source TEXT, -- 'midjourney', 'dalle', 'stable-diffusion', 'manual'
    is_premium BOOLEAN DEFAULT false,
    is_animated BOOLEAN DEFAULT false,
    price_credits INTEGER DEFAULT 0,
    downloads INTEGER DEFAULT 0,
    likes INTEGER DEFAULT 0,
    views INTEGER DEFAULT 0,
    ai_score INTEGER, -- 0-100 quality score
    metadata JSONB, -- Store prompt, model version, etc
    status TEXT DEFAULT 'active', -- 'active', 'pending', 'rejected'
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Tags table
CREATE TABLE tags (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT UNIQUE NOT NULL,
    usage_count INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Asset tags junction table
CREATE TABLE asset_tags (
    asset_id UUID REFERENCES assets(id) ON DELETE CASCADE,
    tag_id UUID REFERENCES tags(id) ON DELETE CASCADE,
    PRIMARY KEY (asset_id, tag_id)
);

-- Downloads tracking
CREATE TABLE downloads (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    asset_id UUID REFERENCES assets(id) ON DELETE CASCADE,
    user_id TEXT, -- Anonymous or logged in user
    ip_address TEXT,
    user_agent TEXT,
    downloaded_at TIMESTAMP DEFAULT NOW()
);

-- Likes tracking
CREATE TABLE likes (
    asset_id UUID REFERENCES assets(id) ON DELETE CASCADE,
    user_id TEXT NOT NULL,
    liked_at TIMESTAMP DEFAULT NOW(),
    PRIMARY KEY (asset_id, user_id)
);

-- Create indexes for performance
CREATE INDEX idx_assets_creator ON assets(creator_id);
CREATE INDEX idx_assets_downloads ON assets(downloads DESC);
CREATE INDEX idx_assets_created ON assets(created_at DESC);
CREATE INDEX idx_assets_status ON assets(status);
CREATE INDEX idx_assets_premium ON assets(is_premium);
CREATE INDEX idx_tags_name ON tags(name);
CREATE INDEX idx_downloads_asset ON downloads(asset_id);
CREATE INDEX idx_downloads_time ON downloads(downloaded_at DESC);

-- Full text search index
CREATE INDEX idx_assets_search ON assets USING gin(to_tsvector('english', name || ' ' || COALESCE(description, '')));

-- View for marketplace browse
CREATE VIEW marketplace_browse AS
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
    ARRAY_AGG(t.name) AS tags
FROM assets a
JOIN creators c ON a.creator_id = c.id
LEFT JOIN asset_tags at ON a.id = at.asset_id
LEFT JOIN tags t ON at.tag_id = t.id
WHERE a.status = 'active'
GROUP BY a.id, c.id;
