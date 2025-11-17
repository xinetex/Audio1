# AgentCache.ai Production Setup

## Quick Start

Audio1.TV is currently using the **demo API key** for testing. Follow these steps to move to production:

## Step 1: Get Production API Key

Since you own **agentcache.ai**, you have two options:

### Option A: Create Your Own Key
1. Access your AgentCache.ai admin panel
2. Generate a new API key for Audio1.TV
3. Set appropriate quota (recommended: Pro tier 150K/mo)
4. Copy the key (format: `ac_live_XXXXXXXX`)

### Option B: Use Admin Override
If you have an admin key, you can bypass quotas for your own service.

## Step 2: Update Audio1.TV Code

Edit `audio1tv-ai-vj.html` around **line 1319**:

```javascript
const AGENTCACHE = {
  apiKey: 'ac_live_YOUR_PRODUCTION_KEY_HERE', // Replace demo key
  baseUrl: 'https://agentcache.ai/api',
  namespace: 'audio1tv'
};
```

## Step 3: Deploy

```bash
git add audio1tv-ai-vj.html
git commit -m "chore: add production AgentCache API key"
git push origin main
```

Your Vercel deployment will auto-update within 2-3 minutes.

## Step 4: Verify

1. Upload a test audio file
2. Check browser console for: `⚡ Cache hit!` or `✅ Cached audio analysis`
3. Upload same file again → should see instant `<50ms` load

## Current Configuration

| Setting | Value |
|---------|-------|
| API Key | `ac_demo_test123` (DEMO) |
| Base URL | `https://agentcache.ai/api` |
| Namespace | `audio1tv` |
| TTL | 30 days (2,592,000 seconds) |
| Rate Limit | 100 req/min (demo) |

## Production Recommendations

### Namespace Strategy

Consider using versioned namespaces for cache invalidation:

```javascript
namespace: 'audio1tv-v1' // Increment when analysis algorithm changes
```

This allows you to:
- Test new analysis versions side-by-side
- Invalidate old cache without database flush
- Roll back if issues detected

### Monitoring

Add these metrics to your dashboard:
- **Cache hit rate** - Target: >85%
- **Average analysis time** - Target: <100ms
- **API errors** - Target: <0.1%

### Error Handling

Current implementation gracefully falls back to local analysis if AgentCache fails. Monitor these scenarios:

```javascript
// Already handled in code:
try {
  const cached = await checkAudioCache(fingerprint);
  // ... use cache
} catch (error) {
  console.warn('AgentCache check failed:', error);
  return null; // Fallback to local analysis
}
```

### Quota Management

For production scale:

| Expected Traffic | Recommended Plan | Cost |
|------------------|------------------|------|
| <1K songs/mo | Free | $0 |
| <25K songs/mo | Starter | $19/mo |
| <150K songs/mo | Pro | $49/mo ⭐ |
| 150K+ songs/mo | Business | $149/mo |

**ROI Example**: At 85% hit rate with Pro plan:
- Save ~5 seconds per cache hit
- 127K cache hits/mo × 5s = 176 hours saved
- User experience: Instant vs 5-second wait

## Advanced: Self-Hosted Option

Since you own AgentCache.ai, you could self-host for Audio1.TV:

### Benefits:
- ✅ No API key required
- ✅ Unlimited quotas
- ✅ Custom retention policies
- ✅ Direct Redis access

### Setup:
1. Deploy AgentCache API to your own Vercel project
2. Point `baseUrl` to your instance
3. Use internal auth token

```javascript
const AGENTCACHE = {
  apiKey: 'internal_audio1tv_token',
  baseUrl: 'https://cache.audio1tv.com/api', // Your domain
  namespace: 'audio1tv'
};
```

## Security Considerations

### API Key Storage

**❌ Don't**: Commit production keys to GitHub
**✅ Do**: Use environment variables (if moving to server-side)

For client-side apps like Audio1.TV:
- Keys are visible in source (acceptable for read-only cache)
- Use rate limiting to prevent abuse
- Monitor usage for anomalies

### Rate Limit Protection

Demo key: **100 req/min** - adequate for testing
Production: **500 req/min** - handles 30K users/hour

If you hit limits:
1. Implement client-side debouncing (300ms delay)
2. Cache fingerprints in localStorage
3. Upgrade plan or implement queue

## Testing Checklist

Before going to production:

- [ ] Upload same audio file twice → instant on second load
- [ ] Check console for `✅ Cached audio analysis` message
- [ ] Verify cache hit shows `⚡ Cache hit! Instant analysis`
- [ ] Test with 5+ different audio files
- [ ] Confirm BPM/beats match original analysis
- [ ] Test graceful fallback (disconnect internet, should still work)

## Support

- Your own service: admin@agentcache.ai
- Audio1.TV issues: Check AGENTCACHE-INTEGRATION.md
- Rate limiting: Upgrade plan or adjust quotas in admin panel

---

**Ready to deploy?** Just replace the API key and push to GitHub! 🚀
