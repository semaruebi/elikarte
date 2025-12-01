// ============================================
// テーマ管理
// ============================================

function cycleTheme() {
    const body = document.body;
    const current = body.getAttribute('data-theme') || 'dark';
    const themes = [
        { name: 'dark', icon: 'fa-moon' },
        { name: 'light', icon: 'fa-sun' },
        { name: 'sigewinne', icon: 'fa-heart' }
    ];
    
    const currentIndex = themes.findIndex(t => t.name === current);
    const nextTheme = themes[(currentIndex + 1) % themes.length];
    
    if (nextTheme.name === 'dark') {
        body.removeAttribute('data-theme');
    } else {
        body.setAttribute('data-theme', nextTheme.name);
    }
    
    const icon = document.getElementById('theme-icon');
    if (icon) {
        icon.className = `fas ${nextTheme.icon}`;
        icon.setAttribute('aria-label', `${nextTheme.name}テーマ`);
    }
    
    localStorage.setItem('rta_theme', nextTheme.name);
    showToast(`テーマを${nextTheme.name}に切り替えました`, 'success', 2000);
}

function loadTheme() {
    const savedTheme = localStorage.getItem('rta_theme') || 'dark';
    const body = document.body;
    const icon = document.getElementById('theme-icon');
    
    if (!icon) return;
    
    const themeMap = {
        dark: { attr: null, icon: 'fa-moon' },
        light: { attr: 'light', icon: 'fa-sun' },
        sigewinne: { attr: 'sigewinne', icon: 'fa-heart' }
    };
    
    const theme = themeMap[savedTheme] || themeMap.dark;
    
    if (theme.attr) {
        body.setAttribute('data-theme', theme.attr);
    } else {
        body.removeAttribute('data-theme');
    }
    
    icon.className = `fas ${theme.icon}`;
    icon.setAttribute('aria-label', `${savedTheme}テーマ`);
}

