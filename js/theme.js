// ============================================
// テーマ管理
// ============================================

function cycleTheme() {
    const body = document.body;
    const current = body.getAttribute('data-theme') || 'dark';
    const themes = [
        { name: 'dark', displayName: '夜の診療所', icon: 'fa-moon' },
        { name: 'light', displayName: 'シグウィンデイタイム', icon: 'fa-sun' },
        { name: 'sigewinne', displayName: 'おシグテーマ', icon: 'fa-heart' }
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
        icon.setAttribute('aria-label', `${nextTheme.displayName}テーマ`);
    }
    
    localStorage.setItem('rta_theme', nextTheme.name);
    showToast(`テーマを「${nextTheme.displayName}」に切り替えたわよ✨`, 'success', 2000);
}

function loadTheme() {
    const savedTheme = localStorage.getItem('rta_theme') || 'dark';
    const body = document.body;
    const icon = document.getElementById('theme-icon');
    
    if (!icon) return;
    
    const themeMap = {
        dark: { attr: null, icon: 'fa-moon', displayName: '夜の診療所' },
        light: { attr: 'light', icon: 'fa-sun', displayName: 'シグウィンデイタイム' },
        sigewinne: { attr: 'sigewinne', icon: 'fa-heart', displayName: 'おシグテーマ' }
    };
    
    const theme = themeMap[savedTheme] || themeMap.dark;
    
    if (theme.attr) {
        body.setAttribute('data-theme', theme.attr);
    } else {
        body.removeAttribute('data-theme');
    }
    
    icon.className = `fas ${theme.icon}`;
    icon.setAttribute('aria-label', `${theme.displayName}テーマ`);
}



