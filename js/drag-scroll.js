// ============================================
// ドラッグスクロール機能
// ============================================

/**
 * 横スクロールコンテナにドラッグスクロール機能を追加
 */
function initDragScroll() {
    const containers = document.querySelectorAll('.card-scroll-container');
    
    containers.forEach(container => {
        // 既にイベントリスナーが設定されているかチェック
        if (container.dataset.dragScrollInitialized === 'true') {
            return;
        }
        container.dataset.dragScrollInitialized = 'true';
        
        let isDown = false;
        let isDragging = false;
        let startX;
        let currentX;
        const dragThreshold = 5; // ドラッグとみなす最小移動距離（ピクセル）
        
        const handleMouseDown = (e) => {
            // リンクやボタンの場合のみドラッグを無効化
            if (e.target.closest('a, button, input, textarea')) {
                return;
            }
            
            isDown = true;
            isDragging = false;
            startX = e.pageX;
            currentX = e.pageX;
        };
        
        const handleMouseLeave = () => {
            isDown = false;
            isDragging = false;
            container.classList.remove('dragging');
        };
        
        const handleMouseUp = () => {
            isDown = false;
            
            setTimeout(() => {
                isDragging = false;
                container.classList.remove('dragging');
            }, 50);
        };
        
        const handleMouseMove = (e) => {
            if (!isDown) return;
            
            const distance = Math.abs(e.pageX - startX);
            
            // 閾値を超えたらドラッグ開始
            if (distance > dragThreshold && !isDragging) {
                isDragging = true;
                container.classList.add('dragging');
            }
            
            if (isDragging) {
                e.preventDefault();
                
                // 前フレームからの差分を計算（スムーズな動きに）
                const deltaX = currentX - e.pageX;
                currentX = e.pageX;
                
                // スクロール位置を更新
                container.scrollLeft += deltaX;
            }
        };
        
        const handleClick = (e) => {
            if (isDragging) {
                e.preventDefault();
                e.stopPropagation();
                return;
            }
            
            // クリック時にカードを開く
            const card = e.target.closest('.compact-card');
            if (card) {
                const postId = card.dataset.postId;
                if (postId) {
                    expandCard(postId);
                }
            }
        };
        
        container.addEventListener('mousedown', handleMouseDown);
        container.addEventListener('mouseleave', handleMouseLeave);
        container.addEventListener('mouseup', handleMouseUp);
        container.addEventListener('mousemove', handleMouseMove);
        container.addEventListener('click', handleClick, true);
    });
}

// ページ読み込み時にドラッグスクロールを初期化
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initDragScroll);
} else {
    // DOMContentLoadedが既に発火済みの場合
    initDragScroll();
}

// ページ読み込み時とデータ更新時にドラッグスクロールを初期化
document.addEventListener('DOMContentLoaded', initDragScroll);

