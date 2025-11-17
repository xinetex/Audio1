# Quick Deploy: Audio1.TV Marketplace

## ✅ What's Ready

1. **Database Schema** → `marketplace-schema.sql`
2. **API Routes** → `api/marketplace/*.js` (4 files)
3. **Frontend UI** → Already in `audio1tv-ai-vj.html`
4. **Frontend JS** → `marketplace-frontend.js`

## 🚀 Deploy in 5 Steps

### Step 1: Setup Database
```bash
# Login to Neon dashboard
# Navigate to SQL Editor
# Copy/paste marketplace-schema.sql
# Click "Run"
```

### Step 2: Copy API Files to Your Repo
```bash
# From audiovisual-art-tool directory
cp -r api /path/to/your/Audio1.git/

# Or manually copy:
# api/marketplace/browse.js
# api/marketplace/contribute.js
# api/marketplace/download.js
# api/marketplace/stats.js
# api/package.json
```

### Step 3: Install Dependencies
```bash
cd /path/to/your/Audio1.git
npm install @neondatabase/serverless
```

### Step 4: Add Marketplace JS to HTML
Open `audio1tv-ai-vj.html` and paste the contents of `marketplace-frontend.js` 
before the closing `</script>` tag (around line 2645).

### Step 5: Push to GitHub
```bash
git add .
git commit -m "Add marketplace system with Neon backend"
git push origin main
```

Vercel will auto-deploy! ✨

## 🧪 Test It

1. Go to your deployed site: `https://your-domain.vercel.app`
2. Open the VJ tool
3. Click the 🛒 **MARKET** tab in Ingredients panel
4. Try contributing an asset
5. Check Neon dashboard to see data

## 🔧 Configuration

Update `marketplace-frontend.js` line 5:
```javascript
apiBase: 'https://your-domain.vercel.app/api'
```

Or keep it as `/api` if HTML is on the same domain.

## 📝 Seed Data (Optional)

Run in Neon SQL Editor:
```sql
-- Create your profile
INSERT INTO creators (creator_id, username) 
VALUES ('34b20bcf-eb56-44fa-a1ab-f2ec751d34e1', 'letstaco')
RETURNING id;

-- Copy the UUID from above, then:
INSERT INTO assets (creator_id, name, image_url, source, ai_score)
VALUES 
  ('PASTE-UUID-HERE', 'Test Asset 1', 'https://picsum.photos/seed/test1/800', 'midjourney', 90),
  ('PASTE-UUID-HERE', 'Test Asset 2', 'https://picsum.photos/seed/test2/800', 'dalle', 85);

-- Add tags
INSERT INTO tags (name) VALUES ('test'), ('demo'), ('midjourney');

-- Link tags to assets (get asset IDs first)
INSERT INTO asset_tags (asset_id, tag_id)
SELECT a.id, t.id
FROM assets a, tags t
WHERE t.name IN ('test', 'demo');
```

## 🎯 Features Enabled

✅ Browse marketplace assets  
✅ Search by keyword  
✅ Filter by source (MJ, DALL·E, SD)  
✅ Filter by premium/animated  
✅ Download tracking  
✅ Contribute new assets  
✅ Creator credits system  
✅ Tag-based discovery  
✅ Quality scoring  
✅ Real-time stats  

## 💡 Next Steps

- Add authentication (Clerk/Auth0)
- Enable file uploads (Vercel Blob)
- Add payment system (Stripe)
- Build creator dashboard
- Add asset moderation
- Social features (likes, comments)

## 🐛 Troubleshooting

**"API not connected"** → Check DATABASE_URL in Vercel env vars  
**"No assets found"** → Run seed data SQL  
**CORS errors** → API and HTML must be on same domain  
**Deploy failed** → Check `npm install @neondatabase/serverless` ran

## 📊 Monitor

- Neon dashboard → SQL queries, connections
- Vercel dashboard → Function logs, errors
- Browser console → API responses, errors

---

**Your marketplace is now live!** 🎉

Users can browse community slop, contribute their Midjourney/DALL·E generations, and earn credits. The whole system runs serverless on your existing Vercel + Neon stack.
