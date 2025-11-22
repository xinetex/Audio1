# 🎮 Retro Diffusion API Setup Guide

**Ready to generate authentic pixel art!**

---

## Quick Setup

### 1. Add Your API Key

**Option A: Using .env file (Recommended)**

1. Open or create the `.env` file:
   ```bash
   cd /Users/letstaco/Documents/audiovisual-art-tool/packages/server
   
   # If .env doesn't exist, create it from the example
   cp .env.example .env
   
   # Or just create a new one
   touch .env
   ```

2. Add your Retro Diffusion API key:
   ```env
   # Your existing keys
   PORT=3001
   REPLICATE_API_TOKEN=your_replicate_token_here
   
   # Add this line with YOUR actual API key
   RETRO_DIFFUSION_API_KEY=your_actual_retro_diffusion_key_here
   ```

3. Save the file

**Option B: Export as environment variable (Temporary)**
   ```bash
   export RETRO_DIFFUSION_API_KEY="your_actual_key_here"
   ```

---

## Test the Integration

### 1. Start the Server

```bash
cd /Users/letstaco/Documents/audiovisual-art-tool
pnpm dev
```

The server will start on `http://localhost:3001`

### 2. Test Pixel Art Generation

**Using curl:**
```bash
curl -X POST http://localhost:3001/api/image/generate \
  -H "Content-Type: application/json" \
  -d '{
    "prompt": "warrior with sword",
    "style": "8bit"
  }'
```

**Expected response:**
```json
{
  "imageUrl": "http://localhost:3001/outputs/images/retro-diffusion-1234567890.png",
  "prompt": "detailed pixel art of warrior with sword, NES style, 8-bit game sprite, retro gaming, pixel art style, pixel art"
}
```

---

## How It Works

### Automatic Routing

The system **automatically** uses Retro Diffusion when:

1. **Model specified**: `"model": "retro-diffusion"`
2. **Pixel art style**: `"style"` contains "pixel", "8bit", or "16bit"

### Style Options

```javascript
// 8-Bit NES Style
{ "prompt": "hero character", "style": "8bit" }

// 16-Bit SNES Style  
{ "prompt": "dragon boss", "style": "16bit" }

// Game Boy (4 colors)
{ "prompt": "platformer level", "style": "gameboy" }

// Minecraft/Voxel
{ "prompt": "building block", "style": "minecraft" }

// Classic Arcade
{ "prompt": "spaceship", "style": "arcade" }

// Generic Pixel Art
{ "prompt": "character sprite", "style": "pixel" }
```

### Size Selection

The system automatically chooses the right model:

| Size | Model Used | Best For |
|------|------------|----------|
| 16x16 | RetroDiffusion16xModel | Tiny icons, Minecraft |
| 32x32 | RetroDiffusion32xModel | Classic sprites |
| 64x64 | RetroDiffusion64xModel | Detailed sprites |
| 128x128 | RetroDiffusion128xModel | Large assets |
| 256x256 | RetroDiffusion32xModel (scaled) | Preview/export |

---

## Using in ThunderVerse Studio

### 1. Open ThunderVerse Studio

```bash
open /Users/letstaco/Documents/audiovisual-art-tool/workspace/studio.html
```

### 2. Generate Pixel Art

1. Click **AI Generate** tab
2. Enter prompt: "8-bit warrior with sword"
3. Select style: **Pixel Art**
4. Click **🎨 Generate Asset**

The system will automatically use Retro Diffusion!

### 3. Add to Canvas

1. Preview appears after generation (~10-15 seconds)
2. Click **Add to Library**
3. Drag from library to canvas
4. Perfect pixel art, ready to use!

---

## Using in Game Creator Platform

### API Request Example

```typescript
// In your React component
const generatePixelArt = async () => {
  const response = await fetch('http://localhost:3001/api/image/generate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      prompt: 'knight character',
      style: '8bit',
      model: 'retro-diffusion'
    })
  });
  
  const data = await response.json();
  console.log('Generated:', data.imageUrl);
};
```

---

## Prompt Best Practices

### ✅ Good Prompts

```
"warrior with sword and shield"
"wizard casting fireball spell"
"dragon flying, side view"
"platformer game tileset"
"8-bit RPG character, front facing"
```

### ❌ Avoid

```
"Make me a really cool warrior that looks amazing with lots of details and epic background"
```

**Why?** Retro Diffusion works best with **simple, clear descriptions**.

### Auto-Enhanced

Your prompt automatically gets enhanced:
```
Input:  "warrior"
Output: "detailed pixel art of warrior, NES style, 8-bit game sprite, retro gaming, pixel art style, pixel art"
```

---

## Advanced Configuration

### Custom Parameters

```javascript
{
  "prompt": "spaceship",
  "style": "8bit",
  "width": 64,
  "height": 64,
  "steps": 30,        // More steps = better quality (10-50)
  "cfg_scale": 7      // How closely to follow prompt (1-20)
}
```

### Override Model

```javascript
{
  "prompt": "tiny icon",
  "model": "RetroDiffusion16xModel",  // Force specific model
  "width": 16,
  "height": 16
}
```

---

## Troubleshooting

### ❌ "RETRO_DIFFUSION_API_KEY not configured"

**Solution**: Make sure you added the key to `.env` file and restarted the server.

```bash
# Check if .env exists
cat packages/server/.env

# Restart server
pnpm dev
```

### ❌ "Retro Diffusion API error: 401"

**Solution**: Invalid API key. Double-check your key at https://retrodiffusion.ai/

### ❌ "Retro Diffusion API error: 402"

**Solution**: Out of credits. Check your balance at https://retrodiffusion.ai/pricing

### ❌ Image doesn't load in browser

**Solution**: CORS is already configured, but make sure server is running:
```bash
curl http://localhost:3001/api/health
```

Should return: `{"status":"ok"}`

---

## Cost Tracking

### Credit Usage

Retro Diffusion uses credits:
- ~1-2 credits per 256x256 image
- ~0.5 credits per 32x32 sprite
- 50 free credits on signup

### Estimate Monthly Cost

| Usage | Credits/Month | Cost |
|-------|---------------|------|
| Testing (10 images) | ~15 | Free |
| Light (100 images) | ~150 | ~$3-5 |
| Medium (500 images) | ~750 | ~$15-25 |
| Heavy (2000 images) | ~3000 | ~$60-100 |

**Tip**: For heavy usage, consider the **Retro Diffusion Aseprite Extension** ($65 one-time) for unlimited local generation.

---

## Testing Checklist

Use this to verify everything works:

- [ ] Added API key to `.env`
- [ ] Restarted server (`pnpm dev`)
- [ ] Server running on `http://localhost:3001`
- [ ] Test curl command returns image URL
- [ ] Image loads in browser at returned URL
- [ ] ThunderVerse Studio can generate pixel art
- [ ] Generated art appears in asset library
- [ ] Can drag to canvas successfully

---

## Next Steps

### 1. Generate Your First Character

```bash
curl -X POST http://localhost:3001/api/image/generate \
  -H "Content-Type: application/json" \
  -d '{
    "prompt": "hero character for platformer game",
    "style": "8bit"
  }'
```

### 2. Try Different Styles

Test all 6 styles to see which you prefer:
- 8bit (NES)
- 16bit (SNES)
- gameboy
- minecraft
- arcade
- pixel

### 3. Build a Sprite Sheet

Generate multiple frames:
```bash
# Frame 1: Idle
curl ... -d '{"prompt": "hero idle stance", "style": "8bit"}'

# Frame 2: Walk
curl ... -d '{"prompt": "hero walking", "style": "8bit"}'

# Frame 3: Jump
curl ... -d '{"prompt": "hero jumping", "style": "8bit"}'
```

---

## Integration Status

✅ **Server-side integration complete**
- Retro Diffusion service created
- Image route updated with auto-routing
- CORS headers configured
- Error handling added

✅ **Ready to use in**:
- ThunderVerse Studio (HTML)
- Game Creator Platform (Next.js)
- Any HTTP client

⏳ **Future enhancements**:
- Nano Banana Pro integration (add GOOGLE_AI_API_KEY)
- Pipeline mode (concept → pixel art)
- Sprite sheet generator
- Animation frame sequencing

---

## Example Gallery

Once you generate some sprites, they'll be saved in:
```
/Users/letstaco/Documents/audiovisual-art-tool/packages/server/outputs/images/
```

View them:
```bash
open packages/server/outputs/images/
```

Or in browser:
```
http://localhost:3001/outputs/images/retro-diffusion-1234567890.png
```

---

## Support

### API Documentation
- Retro Diffusion API: https://retrodiffusion.ai/docs
- Account/Credits: https://retrodiffusion.ai/account

### Community
- Retro Diffusion Discord: https://discord.gg/retrodiffusion
- Astropulse Twitter: https://twitter.com/RealAstropulse

### Issues?
Check the server logs for detailed error messages:
```bash
# Watch server logs in real-time
tail -f packages/server/logs/*.log

# Or just watch terminal output when running
pnpm dev
```

---

**🎮 Ready to generate authentic pixel art! Just add your API key and start creating! ⚡**
