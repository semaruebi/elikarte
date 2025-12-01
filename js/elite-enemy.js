// ============================================
// 精鋭選択機能
// ============================================

// 選択された精鋭（投稿フォーム用）
let selectedEliteEnemies = [];

// 注意: availableEliteImages は elite-enemy-images.js で定義されているわよ
// 画像を追加したら scripts/update-elite-images.bat を実行してちょうだい💉

/**
 * 2つの文字列の類似度を計算（0-1の範囲）
 */
function calculateSimilarity(str1, str2) {
    // 完全一致なら1.0
    if (str1 === str2) return 1.0;
    
    // 部分一致チェック
    const s1Lower = str1.toLowerCase();
    const s2Lower = str2.toLowerCase();
    
    // str1がstr2に含まれる、またはその逆
    if (s1Lower.includes(s2Lower) || s2Lower.includes(s1Lower)) {
        // 長さの比率も考慮
        const lengthRatio = Math.min(str1.length, str2.length) / Math.max(str1.length, str2.length);
        return 0.7 + (lengthRatio * 0.3);
    }
    
    // 共通文字数を計算
    let commonChars = 0;
    const chars1 = str1.split('');
    const chars2 = str2.split('');
    
    chars1.forEach(char => {
        const index = chars2.indexOf(char);
        if (index !== -1) {
            commonChars++;
            chars2.splice(index, 1); // 使った文字は削除
        }
    });
    
    const maxLength = Math.max(str1.length, str2.length);
    return commonChars / maxLength;
}

/**
 * 精鋭名から最適な画像ファイルを見つける
 */
function findBestMatchImage(enemyName) {
    let bestMatch = null;
    let bestScore = 0;
    
    availableEliteImages.forEach(filename => {
        // "アイコン_"を除去して拡張子も除去
        const nameWithoutPrefix = filename.replace('アイコン_', '').replace(/\.(jpg|webp|png)(\.webp)?$/, '');
        
        // 類似度を計算
        const score = calculateSimilarity(enemyName, nameWithoutPrefix);
        
        if (score > bestScore) {
            bestScore = score;
            bestMatch = filename;
        }
    });
    
    // スコアが0.3以上なら採用
    return bestScore >= 0.3 ? bestMatch : null;
}

/**
 * 精鋭名から画像パスを取得（曖昧マッチング）
 */
function getEliteEnemyImagePath(enemyName) {
    const matchedFile = findBestMatchImage(enemyName);
    
    if (!matchedFile) {
        return null; // 画像なし
    }
    
    const basePath = 'assets/images/eliteenemies/';
    const encodedFileName = encodeURIComponent(matchedFile);
    
    return `${basePath}${encodedFileName}`;
}

/**
 * 画像読み込みエラー時のフォールバック処理
 */
function handleEliteImageError(img, enemyName) {
    // 画像が見つからなかったらテキスト表示
    img.style.display = 'none';
    if (img.nextElementSibling) {
        img.nextElementSibling.style.display = 'block';
    }
}

/**
 * 精鋭選択モーダルを開く
 */
function openEliteEnemyModal() {
    const modal = document.getElementById('elite-enemy-modal');
    const list = document.getElementById('elite-enemy-list');
    
    if (!modal || !list) return;
    
    // 精鋭データがまだ読み込まれていない場合
    if (!allData.eliteEnemies || allData.eliteEnemies.length === 0) {
        list.innerHTML = `
            <div style="text-align: center; padding: 40px; color: var(--comment);">
                <img src="assets/images/sigewinne/ofuton.webp" alt="リラックス中のシグウィン" style="width: 100px; height: 100px; object-fit: contain; margin: 0 auto 20px; display: block;">
                <p>精鋭データが読み込まれていないわ💦</p>
                <p style="font-size: 0.9em;">GAS側のコードを更新してデプロイし直してね。</p>
            </div>
        `;
        openModal('elite-enemy-modal');
        return;
    }
    
    // 精鋭リストを生成
    let html = '';
    allData.eliteEnemies.forEach(category => {
        html += `
            <div class="elite-category">
                <h4 class="elite-category-title">${escapeHtml(category.category)}</h4>
                <div class="elite-enemies-grid">
        `;
        
        category.enemies.forEach(enemy => {
            const isSelected = selectedEliteEnemies.includes(enemy);
            const imagePath = getEliteEnemyImagePath(enemy);
            const enemyId = `elite-${category.category}-${enemy}`.replace(/[^a-zA-Z0-9-]/g, '_');
            
            if (imagePath) {
                // 画像がある場合
                html += `
                    <button 
                        type="button"
                        class="elite-enemy-item ${isSelected ? 'selected' : ''}" 
                        onclick="toggleEliteEnemy('${escapeHtml(enemy).replace(/'/g, "\\'")}')"
                        data-enemy="${escapeHtml(enemy)}"
                        title="${escapeHtml(enemy)}"
                    >
                        <img 
                            id="${enemyId}"
                            src="${imagePath}" 
                            alt="${escapeHtml(enemy)}"
                            loading="lazy"
                            onerror="handleEliteImageError(this, '${escapeHtml(enemy).replace(/'/g, "\\'")}')"
                        >
                        <span class="elite-enemy-name-fallback" style="display:none;">${escapeHtml(enemy)}</span>
                        <span class="elite-enemy-tooltip">${escapeHtml(enemy)}</span>
                    </button>
                `;
            } else {
                // 画像がない場合はテキストのみ
                html += `
                    <button 
                        type="button"
                        class="elite-enemy-item elite-enemy-text-only ${isSelected ? 'selected' : ''}" 
                        onclick="toggleEliteEnemy('${escapeHtml(enemy).replace(/'/g, "\\'")}')"
                        data-enemy="${escapeHtml(enemy)}"
                        title="${escapeHtml(enemy)}"
                    >
                        <span class="elite-enemy-name-fallback">${escapeHtml(enemy)}</span>
                        <span class="elite-enemy-tooltip">${escapeHtml(enemy)}</span>
                    </button>
                `;
            }
        });
        
        html += `
                </div>
            </div>
        `;
    });
    
    list.innerHTML = html;
    openModal('elite-enemy-modal');
}

/**
 * 精鋭選択モーダルを閉じる
 */
function closeEliteEnemyModal() {
    closeModal('elite-enemy-modal');
    updateSelectedEliteEnemiesDisplay();
}

/**
 * 精鋭の選択/選択解除をトグル
 */
function toggleEliteEnemy(enemy) {
    const index = selectedEliteEnemies.indexOf(enemy);
    const btn = document.querySelector(`.elite-enemy-item[data-enemy="${enemy}"]`);
    
    if (index > -1) {
        // 選択解除
        selectedEliteEnemies.splice(index, 1);
        if (btn) btn.classList.remove('selected');
    } else {
        // 選択
        selectedEliteEnemies.push(enemy);
        if (btn) btn.classList.add('selected');
    }
}

/**
 * 選択された精鋭の表示を更新
 */
function updateSelectedEliteEnemiesDisplay() {
    const container = document.getElementById('selected-elite-enemies');
    if (!container) return;
    
    if (selectedEliteEnemies.length === 0) {
        container.innerHTML = '<p style="color: var(--comment); font-size: 0.9em; margin: 0;">まだ選択されていないわ</p>';
        return;
    }
    
    let html = '';
    selectedEliteEnemies.forEach(enemy => {
        const imagePath = getEliteEnemyImagePath(enemy);
        
        if (imagePath) {
            // 画像がある場合
            html += `
                <span class="selected-elite-tag selected-elite-tag-with-image" title="${escapeHtml(enemy)}">
                    <img src="${imagePath}" alt="${escapeHtml(enemy)}" class="selected-elite-icon" onerror="this.style.display='none'; this.nextElementSibling.style.display='inline';">
                    <span class="selected-elite-name-fallback" style="display:none;">${escapeHtml(enemy)}</span>
                    <span class="elite-tag-tooltip">${escapeHtml(enemy)}</span>
                    <button type="button" onclick="removeEliteEnemy('${escapeHtml(enemy).replace(/'/g, "\\'")}')" aria-label="削除" class="remove-elite-btn" title="削除">
                        <i class="fas fa-times" aria-hidden="true"></i>
                    </button>
                </span>
            `;
        } else {
            // 画像がない場合はテキストのみ
            html += `
                <span class="selected-elite-tag">
                    ${escapeHtml(enemy)}
                    <button type="button" onclick="removeEliteEnemy('${escapeHtml(enemy).replace(/'/g, "\\'")}')" aria-label="削除" class="remove-elite-btn">
                        <i class="fas fa-times" aria-hidden="true"></i>
                    </button>
                </span>
            `;
        }
    });
    
    container.innerHTML = html;
}

/**
 * 選択された精鋭を削除
 */
function removeEliteEnemy(enemy) {
    const index = selectedEliteEnemies.indexOf(enemy);
    if (index > -1) {
        selectedEliteEnemies.splice(index, 1);
        updateSelectedEliteEnemiesDisplay();
    }
}

/**
 * 精鋭選択をクリア（編集キャンセル時など）
 */
function clearSelectedEliteEnemies() {
    selectedEliteEnemies = [];
    updateSelectedEliteEnemiesDisplay();
}

/**
 * 編集時に既存の精鋭タグを復元
 */
function loadEliteEnemiesForEdit(eliteEnemiesStr) {
    if (!eliteEnemiesStr) {
        selectedEliteEnemies = [];
    } else {
        selectedEliteEnemies = eliteEnemiesStr.split(',').map(e => e.trim()).filter(e => e);
    }
    updateSelectedEliteEnemiesDisplay();
}

