# AUDIO1.TV Marketplace Setup Guide

## Overview
Real marketplace for AI-generated assets integrated into the VJ tool. Users can browse, contribute, and download community slop.

## Architecture
- **Frontend**: Integrated into `audio1tv-ai-vj.html` 
- **Backend**: Vercel Serverless Functions (in `/api` folder)
- **Database**: Neon PostgreSQL (already configured)
- **Deployment**: GitHub → Vercel (your existing workflow)

## Setup Steps

### 1. Database Setup (Neon)

Run the SQL schema in your Neon dashboard:
```bash
# File: marketplace-schema.sql
```

This creates tables:
- `creators` - User profiles
- `assets` - Marketplace items
- `tags` - Searchable tags
- `asset_tags` - Tag relationships
- `downloads` - Download tracking
- `likes` - Like system

### 2. Environment Variables

Add to Vercel environment variables:
```
DATABASE_URL=postgresql://[your-neon-connection-string]
```

You already have this from your existing setup. No new variables needed!

### 3. API Routes

The following API endpoints are ready to deploy:

#### `/api/marketplace/browse.js`
- GET request with query params:
  - `search` - Text search
  - `filter` - Category filter (midjourney, dalle, stable-diffusion, premium, animated)
  - `sort` - Sort by (recent, popular, trending, quality)
  - `limit` - Items per page (default 20)
  - `offset` - Pagination offset

**Example:**
```
GET /api/marketplace/browse?filter=midjourney&sort=popular&limit=20
```

**Response:**
```json
{
  "assets": [...],
  "pagination": {
    "total": 247,
    "limit": 20,
    "offset": 0,
    "hasMore": true
  }
}
```

#### `/api/marketplace/contribute.js`
- POST request to add new asset
- Body:
```json
{
  "creator_id": "34b20bcf-eb56-44fa-a1ab-f2ec751d34e1",
  "name": "Cyberpunk Neon City",
  "description": "Generated with Midjourney v6",
  "image_url": "https://...",
  "thumbnail_url": "https://...",
  "width": 1920,
  "height": 1080,
  "source": "midjourney",
  "is_premium": false,
  "tags": ["cyberpunk", "neon", "city"],
  "ai_score": 92,
  "metadata": {
    "prompt": "futuristic neon city",
    "model": "midjourney-v6"
  }
}
```

#### `/api/marketplace/download.js`
- POST request to track downloads
- Body: `{ "asset_id": "uuid", "user_id": "optional" }`
- Auto-increments download counters
- Awards credits for premium assets

#### `/api/marketplace/stats.js`
- GET request for marketplace stats
- Returns:
  - Total assets, creators, downloads
  - Trending tags
  - Top creators
  - Recent uploads

### 4. Frontend Integration

The marketplace is already integrated into `audio1tv-ai-vj.html`:

**Features:**
- 🛒 **MARKET tab** in Ingredients panel
- Real-time search and filtering
- Category pills (MJ, DALL·E, SD, Animated, Premium)
- Download tracking
- Contribution modal
- Stats display

**User Flow:**
1. User clicks **MARKET** tab
2. Browses assets or searches
3. Clicks asset → Downloads to staging area
4. AI analyzes and adds to timeline

**Contributing:**
1. User clicks **CONTRIBUTE YOUR SLOP**
2. Modal opens with form:
   - Name, URL, Tags, Notes
   - Premium checkbox
3. Submits → Instantly appears in marketplace
4. Earns credits for downloads

### 5. Deployment

#### Option A: Add to existing repo
```bash
cd /path/to/your/Audio1.git
mkdir -p api/marketplace
cp /Users/letstaco/Documents/audiovisual-art-tool/api/marketplace/* api/marketplace/

git add .
git commit -m "Add marketplace system"
git push origin main
```

#### Option B: Deploy standalone
The `/api` folder structure works with Vercel automatically:
```
/
├── api/
│   └── marketplace/
│       ├── browse.js
│       ├── contribute.js
│       ├── download.js
│       └── stats.js
├── audio1tv-ai-vj.html
└── package.json (add @neondatabase/serverless)
```

### 6. Package Dependencies

Add to `package.json`:
```json
{
  "dependencies": {
    "@neondatabase/serverless": "^0.9.0"
  }
}
```

Run:
```bash
npm install @neondatabase/serverless
```

### 7. Testing

After deployment:

1. **Create database tables:**
   - Go to Neon dashboard
   - Run `marketplace-schema.sql`

2. **Test API endpoints:**
```bash
# Browse
curl https://your-domain.vercel.app/api/marketplace/browse

# Stats
curl https://your-domain.vercel.app/api/marketplace/stats

# Contribute (test)
curl -X POST https://your-domain.vercel.app/api/marketplace/contribute \
  -H "Content-Type: application/json" \
  -d '{
    "creator_id": "34b20bcf-eb56-44fa-a1ab-f2ec751d34e1",
    "name": "Test Asset",
    "image_url": "https://picsum.photos/800/800",
    "tags": ["test", "demo"]
  }'
```

3. **Test frontend:**
   - Open `audio1tv-ai-vj.html`
   - Click **MARKET** tab
   - Should load marketplace assets

### 8. Seeding Initial Data

Run this in Neon SQL editor to add demo content:
```sql
-- Create your creator profile
INSERT INTO creators (creator_id, username) 
VALUES ('34b20bcf-eb56-44fa-a1ab-f2ec751d34e1', 'letstaco')
RETURNING id;

-- Add some demo assets (use the returned creator id)
INSERT INTO assets (creator_id, name, image_url, source, tags, ai_score)
VALUES 
  ('uuid-from-above', 'Cyberpunk Dreams', 'https://picsum.photos/seed/cyber1/800', 'midjourney', 92),
  ('uuid-from-above', 'Neon Waves', 'https://picsum.photos/seed/neon1/800', 'midjourney', 88);
```

## Frontend API Integration

Update the marketplace JavaScript in `audio1tv-ai-vj.html`:

```javascript
const API_BASE = 'https://your-domain.vercel.app/api';

async function loadMarketplace() {
  const res = await fetch(`${API_BASE}/marketplace/browse?limit=20`);
  const data = await res.json();
  renderMarketplaceGrid(data.assets);
  updateStats(data.pagination.total);
}

async function contributeAsset(formData) {
  const res = await fetch(`${API_BASE}/marketplace/contribute`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(formData)
  });
  return res.json();
}
```

## Monetization Strategy

The marketplace is ready for monetization:

1. **Premium Assets** - Creators can mark assets as premium
2. **Credit System** - Downloads award credits to creators
3. **Creator Stats** - Track uploads, downloads, earnings
4. **Quality Scoring** - AI scores (60-100) for asset quality

## Future Enhancements

- User authentication (add Auth0 or Clerk)
- Payment integration (Stripe for premium assets)
- Asset moderation dashboard
- Creator analytics page
- Like/favorite system
- Collections and playlists
- Video assets support
- Bulk upload tools

## Support

Database: Neon PostgreSQL (fully managed)
Functions: Vercel Serverless (auto-scaling)
Storage: Consider adding Vercel Blob for large files

Your existing workflow (GitHub → Vercel) works perfectly!
