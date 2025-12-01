// ============================================
// ナビゲーション機能
// ============================================

/**
 * ルートページへ遷移
 */
function navigateToRoute(region, route) {
    // モーダルを閉じる
    const cardDetailModal = document.getElementById('card-detail-modal');
    if (cardDetailModal) {
        closeCardDetailModal();
    }
    
    // フィルターを設定してルートページを表示
    filterPosts(region, route);
}

