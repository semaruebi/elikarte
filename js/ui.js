// ============================================
// UI操作関連
// ============================================

// グローバル変数
let currentFilter = { region: null, route: null };
let openRegions = {};
let homeSections = { popular: true, latest: true };
let myLikedPosts = JSON.parse(localStorage.getItem('rta_liked_posts') || '[]');
let myLikedComments = JSON.parse(localStorage.getItem('rta_liked_comments') || '[]');

// 定数
const TAG_TYPES = {
    REG: ["NPuI", "PuA", "PuI", "全般"],
    COST: ["制限なし", "低凸", "Cost全般"]
};

// スワイプ検知用
let touchstartX = 0;
let touchendX = 0;
const SWIPE_THRESHOLD = 50;

/**
 * 投稿一覧を表示
 */
function renderPosts() {
    const container = document.getElementById("main-container");
    if (!container) return;
    
    let html = "";
    
    // ルート説明欄を表示（ルートが選択されている場合）
    if (currentFilter.region && currentFilter.route) {
        const routeInfo = allData.routes ? allData.routes.find(r => 
            r.region === currentFilter.region && r.route === currentFilter.route
        ) : null;
        
        if (routeInfo) {
            const escapedRegion = escapeHtml(currentFilter.region);
            const escapedRoute = escapeHtml(currentFilter.route);
            const regionClass = getRegionClass(currentFilter.region);
            
            // 複数の画像と説明を処理
            let imageUrls = [];
            let descriptions = [];
            
            if (routeInfo.imageUrl) {
                imageUrls = routeInfo.imageUrl.split(',').map(url => url.trim()).filter(url => url);
            }
            if (routeInfo.description) {
                descriptions = routeInfo.description.split('|||').map(desc => desc.trim()).filter(desc => desc);
            }
            
            // 画像と説明の数を揃える
            while (descriptions.length < imageUrls.length) {
                descriptions.push('');
            }
            
            html += `
                <div class="route-info-card">
                    <div class="route-info-header">
                        <span class="badge ${regionClass}">${escapedRegion}</span>
                        <h2 class="route-info-title">${escapedRoute}</h2>
                    </div>
                    <div class="route-info-images">
            `;
            
            // 複数の画像を表示
            imageUrls.forEach((imageUrl, index) => {
                const description = descriptions[index] || '';
                const imageId = `route-image-${escapedRegion.replace(/[^a-zA-Z0-9-]/g, '_')}-${escapedRoute.replace(/[^a-zA-Z0-9-]/g, '_')}-${index}`;
                const escapedImageUrl = escapeUrl(imageUrl);
                const escapedDescription = description ? btoa(unescape(encodeURIComponent(description))) : '';
                
                html += `
                    <div class="route-info-image-item" data-image-index="${index}">
                        <div class="route-info-image" 
                             data-route-image-id="${imageId}"
                             data-image-url="${escapedImageUrl}"
                             data-route-name="${escapedRoute}"
                             data-region-name="${escapedRegion}"
                             data-description="${escapedDescription}"
                             onclick="event.stopPropagation(); handleRouteImageClick(this)">
                            <img src="${escapedImageUrl}" alt="${escapedRoute}の画像 ${index + 1}" loading="lazy">
                            <div class="route-image-overlay">
                                <div class="route-overlay-content">
                                    <h3 class="route-overlay-title">${escapedRoute}</h3>
                                    <p class="route-overlay-subtitle">${escapedRegion}</p>
                                    ${description ? `<p class="route-overlay-preview">${escapeHtml(description.replace(/\n/g, ' ').substring(0, 100))}${description.length > 100 ? '...' : ''}</p>` : ''}
                                    <div class="route-overlay-hint">
                                        <i class="fas fa-info-circle" aria-hidden="true"></i> クリックで詳細を表示
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                `;
            });
            
            html += `
                    </div>
                </div>
            `;
        }
    }
    
    const filtered = allData.posts.filter(p => 
        p.region === currentFilter.region && p.route === currentFilter.route
    );
    
    if (filtered.length === 0) {
        html += "<p style='padding:20px'>一番乗りね。可愛い人には、最高のお宝が相応しいのよ。</p>";
    } else {
        filtered.forEach(p => html += createCardHtml(p, true));
    }
    
    container.innerHTML = html;
    
    // Twitter Widgetsを初期化
    initTwitterWidgets();
}

/**
 * サイドバーを描画
 */
function renderSidebar() {
    const nav = document.getElementById("sidebar-nav");
    if (!nav) return;
    
    const counts = {};
    if (allData.posts) {
        allData.posts.forEach(p => {
            if (!counts[p.region]) counts[p.region] = { total: 0, routes: {} };
            counts[p.region].total++;
            if (!counts[p.region].routes[p.route]) counts[p.region].routes[p.route] = 0;
            counts[p.region].routes[p.route]++;
        });
    }
    
    let html = `<div class="nav-item home ${!currentFilter.region ? 'active' : ''}" onclick="showHome()" role="button" tabindex="0" aria-label="ホーム"><i class="fas fa-home" aria-hidden="true"></i> ホーム</div>`;
    const grouped = {};
    
    if (allData.routes) {
        allData.routes.forEach(r => {
            if (!grouped[r.region]) grouped[r.region] = [];
            grouped[r.region].push(r.route);
        });
    }
    
    for (const [region, routes] of Object.entries(grouped)) {
        const isOpen = openRegions[region] ? 'open' : '';
        const iconRot = openRegions[region] ? 'transform: rotate(180deg);' : '';
        const regionCount = (counts[region] && counts[region].total) || 0;
        const escapedRegion = escapeHtml(region);
        const regionId = region.replace(/[^a-zA-Z0-9]/g, '_');
        const regionJs = region.replace(/'/g, "\\'");
        
        const regionClass = getRegionClass(region);
        
        html += `
            <div class="nav-group-title" onclick="toggleRegion('${regionJs}')" data-region="${escapeHtml(region)}" role="button" tabindex="0" aria-expanded="${!!openRegions[region]}" aria-label="${escapedRegion}を${openRegions[region] ? '閉じる' : '開く'}">
                <span><span class="region-dot ${regionClass}">●</span> ${escapedRegion} <span class="count-badge">${regionCount}</span></span>
                <div class="group-meta"><i class="fas fa-chevron-down rotate-icon" style="${iconRot}" aria-hidden="true"></i></div>
            </div>
            <div id="group-${regionId}" class="nav-group-content ${isOpen}" data-region="${escapeHtml(region)}" role="region" aria-labelledby="group-${regionId}">
        `;
        
        routes.forEach(route => {
            const active = (currentFilter.region === region && currentFilter.route === route) ? 'active' : '';
            const routeCount = (counts[region] && counts[region].routes[route]) || 0;
            const escapedRoute = escapeHtml(route);
            const routeJs = route.replace(/'/g, "\\'");
            
            html += `
                <div class="nav-item ${active}" onclick="filterPosts('${regionJs}','${routeJs}')" role="button" tabindex="0" aria-label="${escapedRoute}を表示">
                    <span>${escapedRoute}</span>
                    <span class="count-badge">${routeCount}</span>
                </div>`;
        });
        html += `</div>`;
    }
    nav.innerHTML = html;
}

function toggleRegion(region) {
    const titleEl = Array.from(document.querySelectorAll('.nav-group-title')).find(el => {
        const dataRegion = el.getAttribute('data-region');
        return dataRegion === region;
    });
    
    if (!titleEl) return;
    
    const contentEl = titleEl.nextElementSibling;
    if (!contentEl || !contentEl.classList.contains('nav-group-content')) return;
    
    const contentRegion = contentEl.getAttribute('data-region');
    if (contentRegion !== region) return;
    
    const rotateIcon = titleEl.querySelector('.rotate-icon');
    const isCurrentlyOpen = contentEl.classList.contains('open');
    
    if (isCurrentlyOpen) {
        contentEl.classList.remove('open');
        openRegions[region] = false;
        if (rotateIcon) {
            rotateIcon.style.transform = '';
        }
        titleEl.setAttribute('aria-expanded', 'false');
        const escapedRegion = escapeHtml(region);
        titleEl.setAttribute('aria-label', `${escapedRegion}を開く`);
    } else {
        contentEl.classList.add('open');
        openRegions[region] = true;
        if (rotateIcon) {
            rotateIcon.style.transform = 'rotate(180deg)';
        }
        titleEl.setAttribute('aria-expanded', 'true');
        const escapedRegion = escapeHtml(region);
        titleEl.setAttribute('aria-label', `${escapedRegion}を閉じる`);
    }
}

/**
 * ホーム画面を描画
 */
function renderHome() {
    currentFilter = { region: null, route: null };
    const searchInput = document.getElementById("search-input");
    if (searchInput) {
        searchInput.value = "";
        updateSearchTypeSelector();
    }
    
    const container = document.getElementById("main-container");
    const titleEl = document.getElementById("current-view-title");
    if (!container) return;
    
    if (titleEl) titleEl.innerText = "400EENote";
    
    // 人気順・新着順でソート
    const sortedByLikes = [...allData.posts].sort((a, b) => (b.likes || 0) - (a.likes || 0));
    const sortedByDate = [...allData.posts].sort((a, b) => {
        const dateA = new Date(a.timestamp || 0);
        const dateB = new Date(b.timestamp || 0);
        return dateB - dateA;
    });
    
    const popOpen = homeSections.popular ? 'open' : '';
    const latOpen = homeSections.latest ? 'open' : '';
    
    container.innerHTML = `
        <div class="section-header" onclick="toggleHomeSection('popular')" role="button" tabindex="0" aria-expanded="${homeSections.popular}">
            <span><i class="fas fa-fire" aria-hidden="true"></i> 人気の投稿</span>
            <i class="fas fa-chevron-down section-toggle-icon" style="${homeSections.popular ? 'transform: rotate(180deg);' : ''}" aria-hidden="true"></i>
        </div>
        <div id="section-popular" class="section-content-horizontal ${popOpen}" role="region">
            <div class="card-scroll-container">
                ${sortedByLikes.slice(0, 10).map(p => createCompactCardHtml(p)).join('')}
            </div>
        </div>
        
        <div class="section-header" onclick="toggleHomeSection('latest')" role="button" tabindex="0" aria-expanded="${homeSections.latest}">
            <span><i class="fas fa-clock" aria-hidden="true"></i> 最新の投稿</span>
            <i class="fas fa-chevron-down section-toggle-icon" style="${homeSections.latest ? 'transform: rotate(180deg);' : ''}" aria-hidden="true"></i>
        </div>
        <div id="section-latest" class="section-content-horizontal ${latOpen}" role="region">
            <div class="card-scroll-container">
                ${sortedByDate.slice(0, 10).map(p => createCompactCardHtml(p)).join('')}
            </div>
        </div>
    `;
    
    initTwitterWidgets();
    
    // ドラッグスクロール機能を再初期化（DOMが更新された後）
    setTimeout(() => {
        if (typeof initDragScroll === 'function') {
            initDragScroll();
        }
    }, 200);
}

function toggleHomeSection(sectionName) {
    homeSections[sectionName] = !homeSections[sectionName];
    renderHome();
}

function filterPosts(region, route) {
    currentFilter = { region, route };
    const titleEl = document.getElementById("current-view-title");
    if (titleEl) titleEl.innerText = `${escapeHtml(region)} > ${escapeHtml(route)}`;
    renderPosts();
    closeSidebarOnNavigation();
}

function showHome() {
    renderHome();
}

function toggleMobileSidebar() {
    const sidebar = document.getElementById('mobile-sidebar');
    const body = document.body;
    const menuIcon = document.querySelector('.mobile-menu-btn i');
    if (!sidebar) return;
    
    const isOpen = sidebar.classList.contains('open');
    sidebar.classList.toggle('open');
    body.classList.toggle('sidebar-open');
    sidebar.setAttribute('aria-hidden', isOpen);
    
    if (menuIcon) {
        menuIcon.className = isOpen ? 'fas fa-bars' : 'fas fa-times';
        menuIcon.setAttribute('aria-label', isOpen ? 'メニューを開く' : 'メニューを閉じる');
    }
}

function closeSidebarOnNavigation() {
    const sidebar = document.getElementById('mobile-sidebar');
    const body = document.body;
    const menuIcon = document.querySelector('.mobile-menu-btn i');
    
    if (window.innerWidth <= 900 && sidebar && sidebar.classList.contains('open')) {
        sidebar.classList.remove('open');
        body.classList.remove('sidebar-open');
        sidebar.setAttribute('aria-hidden', 'true');
        if (menuIcon) {
            menuIcon.className = 'fas fa-bars';
            menuIcon.setAttribute('aria-label', 'メニューを開く');
        }
    }
}

function checkSwipeDirection() {
    const sidebar = document.getElementById('mobile-sidebar');
    if (!sidebar) return false;
    
    const isOpen = sidebar.classList.contains('open');
    const deltaX = touchendX - touchstartX;
    if (isOpen && deltaX < -SWIPE_THRESHOLD) {
        toggleMobileSidebar();
        return true;
    }
    return false;
}

function initTwitterWidgets() {
    if (typeof twttr !== 'undefined' && twttr.widgets) {
        twttr.widgets.load();
    } else {
        setTimeout(() => {
            if (typeof twttr !== 'undefined' && twttr.widgets) {
                twttr.widgets.load();
            }
        }, 500);
    }
}

