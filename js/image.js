// ============================================
// 画像プレビュー処理
// ============================================

// 選択されたファイルを保持
let selectedImageFiles = [];
// 編集モード用：既存の画像URLを保持
let existingImageUrls = [];
// 投稿処理中フラグ
let isPosting = false;

function handleImagePreview(e) {
    const preview = document.getElementById('image-preview');
    if (!preview) return;
    
    const files = Array.from(e.target.files);
    addImageFiles(files);
}

function addImageFiles(files) {
    const preview = document.getElementById('image-preview');
    if (!preview) return;
    
    // 既存のファイルと新しいファイルを結合
    const allFiles = [...selectedImageFiles, ...files];
    
    if (allFiles.length > CONFIG.MAX_IMAGES) {
        showToast(`画像は${CONFIG.MAX_IMAGES}枚までなのよ。顔の筋肉を緩めすぎないようにね。`, 'warning');
        return;
    }
    
    // サイズチェック
    for (let file of files) {
        if (file.size > CONFIG.MAX_IMAGE_SIZE) {
            showToast(`${file.name}は2MB以下の画像にしてちょうだい。`, 'error');
            return;
        }
    }
    
    // ファイルを追加
    selectedImageFiles = allFiles;
    updateImagePreview();
    updateImageInput();
}

function removeImageFile(index) {
    selectedImageFiles.splice(index, 1);
    updateImagePreview();
    updateImageInput();
}

function updateImagePreview() {
    const preview = document.getElementById('image-preview');
    if (!preview) return;
    
    preview.innerHTML = "";
    
    // 既存の画像URLを表示（編集モード用）
    existingImageUrls.forEach((url, index) => {
        if (!url || url.trim() === '') return;
        
        const wrapper = document.createElement('div');
        wrapper.className = 'preview-item';
        wrapper.style.position = 'relative';
        wrapper.style.display = 'inline-block';
        
        const img = document.createElement('img');
        img.src = url;
        img.className = 'preview-img';
        img.alt = `既存画像 ${index + 1}`;
        img.setAttribute('loading', 'lazy');
        img.style.cursor = 'pointer';
        img.onclick = () => {
            const modal = document.getElementById('image-modal');
            const modalImg = document.getElementById('modal-image');
            if (modal && modalImg) {
                modalImg.src = url;
                modal.style.display = 'flex';
                modal.setAttribute('aria-hidden', 'false');
                modal.setAttribute('tabindex', '0');
                modal.focus();
            }
        };
        
        const removeBtn = document.createElement('button');
        removeBtn.className = 'preview-remove-btn';
        removeBtn.innerHTML = '<i class="fas fa-times" aria-hidden="true"></i>';
        removeBtn.setAttribute('aria-label', '既存画像を削除');
        removeBtn.onclick = () => {
            existingImageUrls.splice(index, 1);
            updateImagePreview();
        };
        
        const label = document.createElement('div');
        label.style.fontSize = '0.7em';
        label.style.color = 'var(--comment)';
        label.style.marginTop = '2px';
        label.textContent = '既存';
        
        wrapper.appendChild(img);
        wrapper.appendChild(removeBtn);
        wrapper.appendChild(label);
        preview.appendChild(wrapper);
    });
    
    // 新規選択されたファイルを表示
    selectedImageFiles.forEach((file, index) => {
        const reader = new FileReader();
        reader.onload = evt => {
            const wrapper = document.createElement('div');
            wrapper.className = 'preview-item';
            wrapper.style.position = 'relative';
            wrapper.style.display = 'inline-block';
            
            const img = document.createElement('img');
            img.src = evt.target.result;
            img.className = 'preview-img';
            img.alt = `プレビュー画像 ${index + 1}`;
            img.setAttribute('loading', 'lazy');
            
            const removeBtn = document.createElement('button');
            removeBtn.className = 'preview-remove-btn';
            removeBtn.innerHTML = '<i class="fas fa-times" aria-hidden="true"></i>';
            removeBtn.setAttribute('aria-label', '画像を削除');
            removeBtn.onclick = () => removeImageFile(index);
            
            wrapper.appendChild(img);
            wrapper.appendChild(removeBtn);
            preview.appendChild(wrapper);
        };
        reader.onerror = () => {
            showToast(`${file.name}の読み込みに失敗しました`, 'error');
        };
        reader.readAsDataURL(file);
    });
}

function updateImageInput() {
    const input = document.getElementById('input-image');
    if (!input) return;
    
    // DataTransferを使ってファイルリストを更新
    const dataTransfer = new DataTransfer();
    selectedImageFiles.forEach(file => dataTransfer.items.add(file));
    input.files = dataTransfer.files;
}

