// AUDIO1.TV MARKETPLACE - Frontend Integration
// Paste this before the closing </script> tag in audio1tv-ai-vj.html

const MARKETPLACE = {
    apiBase: '/api', // Change to 'https://your-domain.vercel.app/api' when deployed
    currentFilter: 'all',
    currentSearch: '',
    currentSort: 'recent',
    offset: 0,
    limit: 20,
    creatorId: '34b20bcf-eb56-44fa-a1ab-f2ec751d34e1'
};

// Load marketplace assets from API
async function loadMarketplace() {
    try {
        const params = new URLSearchParams({
            filter: MARKETPLACE.currentFilter,
            search: MARKETPLACE.currentSearch,
            sort: MARKETPLACE.currentSort,
            limit: MARKETPLACE.limit,
            offset: MARKETPLACE.offset
        });

        const response = await fetch(`${MARKETPLACE.apiBase}/marketplace/browse?${params}`);
        
        if (!response.ok) throw new Error('Failed to load marketplace');
        
        const data = await response.json();
        
        renderMarketplaceGrid(data.assets);
        updateMarketplaceStats(data.pagination);
        
    } catch (error) {
        console.error('Marketplace error:', error);
        document.getElementById('marketplaceGrid').innerHTML = `
            <div style="grid-column:1/-1;text-align:center;padding:2rem;color:rgba(255,255,255,0.4);">
                <div style="font-size:2rem;margin-bottom:0.5rem;">⚠️</div>
                <div>Could not load marketplace</div>
                <div style="font-size:0.75rem;margin-top:0.5rem;">API not connected yet</div>
            </div>
        `;
    }
}

// Render marketplace grid
function renderMarketplaceGrid(assets) {
    const grid = document.getElementById('marketplaceGrid');
    
    if (!assets || assets.length === 0) {
        grid.innerHTML = `
            <div style="grid-column:1/-1;text-align:center;padding:2rem;color:rgba(255,255,255,0.4);">
                No assets found
            </div>
        `;
        return;
    }
    
    grid.innerHTML = assets.map(asset => `
        <div class="marketplace-item" 
             style="position:relative;border-radius:8px;overflow:hidden;cursor:pointer;background:#0a0014;border:2px solid var(--border);transition:all 0.3s;"
             onmouseenter="this.style.borderColor='var(--neon-cyan)'"
             onmouseleave="this.style.borderColor='var(--border)'">
            
            ${asset.is_premium ? `
                <div style="position:absolute;top:0.5rem;right:0.5rem;background:rgba(255,215,0,0.9);color:#000;padding:0.2rem 0.5rem;border-radius:4px;font-size:0.65rem;font-weight:700;z-index:2;">
                    💎 PREMIUM
                </div>
            ` : ''}
            
            <img src="${asset.thumbnail_url || asset.image_url}" 
                 style="width:100%;height:140px;object-fit:cover;display:block;"
                 onclick="downloadMarketplaceAsset('${asset.id}', '${asset.name}', '${asset.image_url}')"
                 loading="lazy">
            
            <div style="padding:0.6rem;">
                <div style="font-size:0.75rem;font-weight:700;color:var(--neon-cyan);margin-bottom:0.3rem;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">
                    ${asset.name}
                </div>
                
                <div style="font-size:0.65rem;color:rgba(255,255,255,0.4);margin-bottom:0.4rem;">
                    by ${asset.creator_name || asset.creator_id.slice(0, 8)}...
                </div>
                
                ${asset.tags && asset.tags.length > 0 ? `
                    <div style="display:flex;gap:0.3rem;flex-wrap:wrap;margin-bottom:0.4rem;">
                        ${asset.tags.slice(0, 3).map(tag => `
                            <span style="font-size:0.6rem;background:rgba(114,9,183,0.3);color:var(--neon-pink);padding:0.2rem 0.4rem;border-radius:4px;">
                                #${tag}
                            </span>
                        `).join('')}
                    </div>
                ` : ''}
                
                <div style="display:flex;justify-content:space-between;align-items:center;font-size:0.65rem;color:rgba(255,255,255,0.5);">
                    <span>⬇️ ${asset.downloads || 0}</span>
                    ${asset.ai_score ? `<span style="color:var(--neon-cyan);">AI: ${asset.ai_score}</span>` : ''}
                </div>
            </div>
        </div>
    `).join('');
}

// Download asset from marketplace
async function downloadMarketplaceAsset(assetId, name, imageUrl) {
    addAIThought(`Downloading: ${name}`);
    
    // Track download in database
    try {
        await fetch(`${MARKETPLACE.apiBase}/marketplace/download`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                asset_id: assetId,
                user_id: MARKETPLACE.creatorId
            })
        });
    } catch (error) {
        console.error('Download tracking error:', error);
    }
    
    // Load image into VJ tool
    loadImageFromURL(imageUrl, name, () => {
        addAIThought(`✅ Added ${name} from marketplace!`);
    });
}

// Filter marketplace
function filterMarketplace(filter) {
    MARKETPLACE.currentFilter = filter;
    MARKETPLACE.offset = 0;
    
    // Update active state
    document.querySelectorAll('[data-filter]').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.filter === filter);
    });
    
    loadMarketplace();
}
window.filterMarketplace = filterMarketplace;

// Search marketplace
let searchTimeout;
function searchMarketplace() {
    clearTimeout(searchTimeout);
    searchTimeout = setTimeout(() => {
        MARKETPLACE.currentSearch = document.getElementById('marketSearch').value;
        MARKETPLACE.offset = 0;
        loadMarketplace();
    }, 500);
}
window.searchMarketplace = searchMarketplace;

// Update stats display
function updateMarketplaceStats(pagination) {
    if (pagination && pagination.total !== undefined) {
        document.getElementById('marketAssets').textContent = pagination.total;
    }
}

// Load stats from API
async function loadMarketplaceStats() {
    try {
        const response = await fetch(`${MARKETPLACE.apiBase}/marketplace/stats`);
        if (!response.ok) return;
        
        const data = await response.json();
        
        document.getElementById('marketAssets').textContent = data.stats.total_assets;
        document.getElementById('marketCreators').textContent = data.stats.total_creators;
        document.getElementById('marketDownloads').textContent = 
            data.stats.total_downloads > 1000 
                ? (data.stats.total_downloads / 1000).toFixed(1) + 'K' 
                : data.stats.total_downloads;
                
    } catch (error) {
        console.error('Stats error:', error);
        document.getElementById('marketAssets').textContent = '--';
        document.getElementById('marketCreators').textContent = '--';
        document.getElementById('marketDownloads').textContent = '--';
    }
}

// Show contribute modal
function showContributeModal() {
    // Create modal if it doesn't exist
    if (!document.getElementById('contributeModal')) {
        const modal = document.createElement('div');
        modal.id = 'contributeModal';
        modal.style.cssText = 'display:none;position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,0.9);z-index:10000;justify-content:center;align-items:center;';
        
        modal.innerHTML = `
            <div style="background:linear-gradient(135deg,#1a0033,#0a0014);border:2px solid var(--neon-purple);border-radius:16px;padding:2rem;max-width:500px;width:90%;max-height:90vh;overflow-y:auto;">
                <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:1.5rem;">
                    <h2 style="margin:0;color:var(--neon-cyan);font-size:1.3rem;">⬆️ Contribute to Marketplace</h2>
                    <button onclick="closeContributeModal()" style="background:none;border:none;color:var(--neon-pink);font-size:2rem;cursor:pointer;line-height:1;">&times;</button>
                </div>
                
                <div style="margin-bottom:1rem;">
                    <label style="display:block;color:rgba(255,255,255,0.7);font-size:0.85rem;margin-bottom:0.5rem;">Asset Name *</label>
                    <input type="text" id="contributeName" placeholder="e.g., Cyberpunk Neon City" 
                           style="width:100%;padding:0.8rem;background:#0a0014;border:2px solid var(--neon-purple);color:var(--neon-cyan);border-radius:8px;">
                </div>
                
                <div style="margin-bottom:1rem;">
                    <label style="display:block;color:rgba(255,255,255,0.7);font-size:0.85rem;margin-bottom:0.5rem;">Image URL *</label>
                    <input type="text" id="contributeUrl" placeholder="https://cdn.midjourney.com/..." 
                           style="width:100%;padding:0.8rem;background:#0a0014;border:2px solid var(--neon-purple);color:var(--neon-cyan);border-radius:8px;">
                </div>
                
                <div style="margin-bottom:1rem;">
                    <label style="display:block;color:rgba(255,255,255,0.7);font-size:0.85rem;margin-bottom:0.5rem;">Tags (comma separated) *</label>
                    <input type="text" id="contributeTags" placeholder="midjourney, cyberpunk, neon, city" 
                           style="width:100%;padding:0.8rem;background:#0a0014;border:2px solid var(--neon-purple);color:var(--neon-cyan);border-radius:8px;">
                </div>
                
                <div style="margin-bottom:1rem;">
                    <label style="display:block;color:rgba(255,255,255,0.7);font-size:0.85rem;margin-bottom:0.5rem;">Description</label>
                    <textarea id="contributeDescription" placeholder="Generated with Midjourney v6, prompt: futuristic neon city..." 
                              style="width:100%;height:80px;padding:0.8rem;background:#0a0014;border:2px solid var(--neon-purple);color:var(--neon-cyan);border-radius:8px;resize:vertical;"></textarea>
                </div>
                
                <div style="margin-bottom:1rem;">
                    <label style="display:block;color:rgba(255,255,255,0.7);font-size:0.85rem;margin-bottom:0.5rem;">Source</label>
                    <select id="contributeSource" style="width:100%;padding:0.8rem;background:#0a0014;border:2px solid var(--neon-purple);color:var(--neon-cyan);border-radius:8px;">
                        <option value="midjourney">Midjourney</option>
                        <option value="dalle">DALL·E</option>
                        <option value="stable-diffusion">Stable Diffusion</option>
                        <option value="manual">Other/Manual</option>
                    </select>
                </div>
                
                <div style="margin-bottom:1.5rem;">
                    <label style="display:flex;align-items:center;color:rgba(255,255,255,0.7);font-size:0.85rem;cursor:pointer;">
                        <input type="checkbox" id="contributePremium" style="margin-right:0.5rem;width:18px;height:18px;">
                        💎 Mark as Premium (earn credits from downloads)
                    </label>
                </div>
                
                <button onclick="submitContribution()" class="btn" style="width:100%;background:linear-gradient(135deg,var(--neon-pink),var(--neon-purple));padding:1rem;font-size:1rem;">
                    🚀 SUBMIT TO MARKETPLACE
                </button>
                
                <div style="margin-top:1rem;padding:1rem;background:rgba(114,9,183,0.2);border-radius:8px;font-size:0.75rem;color:rgba(255,255,255,0.6);">
                    <strong>💡 Contribution Tips:</strong><br>
                    • High-quality images get more downloads<br>
                    • Tag accurately for discoverability<br>
                    • Premium assets earn you credits<br>
                    • You retain full ownership
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
    }
    
    document.getElementById('contributeModal').style.display = 'flex';
}
window.showContributeModal = showContributeModal;

function closeContributeModal() {
    document.getElementById('contributeModal').style.display = 'none';
}
window.closeContributeModal = closeContributeModal;

// Submit contribution
async function submitContribution() {
    const name = document.getElementById('contributeName').value.trim();
    const url = document.getElementById('contributeUrl').value.trim();
    const tags = document.getElementById('contributeTags').value.trim();
    const description = document.getElementById('contributeDescription').value.trim();
    const source = document.getElementById('contributeSource').value;
    const premium = document.getElementById('contributePremium').checked;
    
    if (!name || !url || !tags) {
        alert('Please fill in Name, URL, and Tags');
        return;
    }
    
    const tagsArray = tags.split(',').map(t => t.trim()).filter(t => t);
    
    const payload = {
        creator_id: MARKETPLACE.creatorId,
        name,
        description,
        image_url: url,
        thumbnail_url: url,
        source,
        is_premium: premium,
        tags: tagsArray,
        ai_score: 75 + Math.floor(Math.random() * 25)
    };
    
    try {
        addAIThought('Submitting to marketplace...');
        
        const response = await fetch(`${MARKETPLACE.apiBase}/marketplace/contribute`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });
        
        if (!response.ok) throw new Error('Failed to contribute');
        
        const result = await response.json();
        
        addAIThought(`🎉 ${name} added to marketplace!`);
        closeContributeModal();
        
        // Reload marketplace
        loadMarketplace();
        loadMarketplaceStats();
        
        // Switch to marketplace tab
        document.querySelector('[data-tab="marketplace"]').click();
        
    } catch (error) {
        console.error('Contribution error:', error);
        alert('Failed to submit. Make sure API is deployed.');
    }
}
window.submitContribution = submitContribution;

// Initialize marketplace when tab is clicked
document.querySelector('[data-tab="marketplace"]').addEventListener('click', () => {
    if (document.getElementById('marketplaceGrid').innerHTML.includes('Loading')) {
        loadMarketplace();
        loadMarketplaceStats();
    }
});

console.log('🛒 Marketplace system loaded');
