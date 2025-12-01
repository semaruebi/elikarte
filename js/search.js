// ============================================
// 検索機能
// ============================================

// グローバル変数
let availableTags = new Set();
let searchType = "content"; // "tag" | "content" | "both"

const debouncedSearch = debounce(() => {
    filterBySearch();
}, CONFIG.SEARCH_DEBOUNCE);

function handleSearchInput() {
    const inputVal = document.getElementById("search-input")?.value || "";
    debouncedSearch();
    showSuggestions(inputVal);
    updateSearchTypeSelector();
}

function updateSearchTypeSelector() {
    const inputVal = document.getElementById("search-input")?.value.trim() || "";
    const selector = document.getElementById("search-type-selector");
    if (!selector) return;
    
    // タグが選択されているかどうかを判定
    const isTagSelected = inputVal && Array.from(availableTags).some(tag => tag.toLowerCase() === inputVal.toLowerCase());
    
    if (isTagSelected || !inputVal) {
        // タグが選択されている場合、または入力がない場合は非表示
        selector.style.display = "none";
    } else {
        // 自由入力の場合は表示
        selector.style.display = "flex";
    }
}

function updateSearchType() {
    const selected = document.querySelector('input[name="search-type"]:checked');
    if (selected) {
        searchType = selected.value;
        filterBySearch();
    }
}

function showSuggestions(filterText = "") {
    const suggestionBox = document.getElementById('search-suggestions');
    if (!suggestionBox) return;
    
    suggestionBox.innerHTML = "";
    
    const filteredTags = Array.from(availableTags).filter(tag => 
        tag.toLowerCase().includes(filterText.toLowerCase())
    ).sort();
    
    if (filteredTags.length === 0) {
        suggestionBox.classList.remove('show');
        return;
    }
    
    filteredTags.forEach(tag => {
        const div = document.createElement('div');
        div.className = 'suggestion-item';
        div.setAttribute('role', 'option');
        div.setAttribute('tabindex', '0');
        div.innerHTML = `<i class="fas fa-tag suggestion-tag-icon" aria-hidden="true"></i> ${escapeHtml(tag)}`;
        
        div.onclick = () => {
            const input = document.getElementById("search-input");
            if (input) {
                input.value = tag;
                updateSearchTypeSelector();
                filterBySearch();
                suggestionBox.classList.remove('show');
            }
        };
        
        div.onkeydown = (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                div.onclick();
            }
        };
        
        suggestionBox.appendChild(div);
    });
    
    suggestionBox.classList.add('show');
    suggestionBox.setAttribute('role', 'listbox');
}

function filterBySearch() {
    const keyword = document.getElementById("search-input")?.value.trim() || "";
    const keywordLower = keyword.toLowerCase();
    const titleEl = document.getElementById("current-view-title");
    
    if (!keyword) {
        renderHome();
        return;
    }
    
    const container = document.getElementById("main-container");
    if (!container) return;
    
    // タグの完全一致チェック用のヘルパー関数
    const hasExactTag = (tagsString, searchTag) => {
        if (!tagsString || !searchTag) return false;
        const tagArray = tagsString.split(',').map(t => t.trim().toLowerCase());
        const searchTagLower = searchTag.toLowerCase();
        return tagArray.includes(searchTagLower);
    };
    
    let filtered;
    
    // 検索タイプに応じてフィルタリング
    if (searchType === "tag") {
        // タグ検索のみ
        filtered = allData.posts.filter(p => 
            p.tags && hasExactTag(p.tags, keyword)
        );
    } else if (searchType === "content") {
        // 本文検索のみ（content, route, region）
        filtered = allData.posts.filter(p => 
            (p.content && p.content.toLowerCase().includes(keywordLower)) ||
            (p.title && p.title.toLowerCase().includes(keywordLower)) ||
            (p.route && p.route.toLowerCase().includes(keywordLower)) ||
            (p.region && p.region.toLowerCase().includes(keywordLower))
        );
    } else {
        // 両方（デフォルト）
        filtered = allData.posts.filter(p => 
            (p.content && p.content.toLowerCase().includes(keywordLower)) ||
            (p.title && p.title.toLowerCase().includes(keywordLower)) ||
            (p.tags && hasExactTag(p.tags, keyword)) ||
            (p.route && p.route.toLowerCase().includes(keywordLower)) ||
            (p.region && p.region.toLowerCase().includes(keywordLower))
        );
    }
    
    if (titleEl) titleEl.innerText = `検索: "${escapeHtml(keyword)}"`;
    
    if (filtered.length === 0) {
        container.innerHTML = "<p style='padding:20px'>検索結果が見つからなかったのよ。別のキーワードで試してみてね。</p>";
    } else {
        container.innerHTML = "";
        filtered.forEach(p => container.appendChild(createCardElement(p)));
    }
    
    const suggestions = document.getElementById('search-suggestions');
    if (suggestions) suggestions.classList.remove('show');
}

function collectAllTags() {
    availableTags.clear();
    if (allData.posts) {
        allData.posts.forEach(post => {
            if (post.tags) {
                const tags = post.tags.split(',');
                tags.forEach(t => {
                    const trimmed = t.trim();
                    if (trimmed) availableTags.add(trimmed);
                });
            }
        });
    }
}

function searchByTag(tag) {
    const input = document.getElementById("search-input");
    if (input) {
        input.value = tag;
        searchType = "tag";
        filterBySearch();
    }
}

