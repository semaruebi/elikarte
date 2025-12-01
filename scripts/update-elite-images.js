// 精鋭画像リストを自動生成するスクリプト
const fs = require('fs');
const path = require('path');

const imagesDir = path.join(__dirname, '../assets/images/eliteenemies');
const outputFile = path.join(__dirname, '../js/elite-enemy-images.js');

console.log('📸 精鋭画像リストを更新するわよ...');

// 画像フォルダからファイル一覧を取得
const files = fs.readdirSync(imagesDir)
    .filter(file => /\.(jpg|jpeg|png|webp)$/i.test(file))
    .sort();

console.log(`✅ ${files.length}個の画像を見つけたわ！`);

// JavaScriptファイルを生成
const jsContent = `// ============================================
// 精鋭画像ファイルリスト（自動生成）
// ============================================
// このファイルは scripts/update-elite-images.js で自動生成されるのよ
// 手動で編集しないでちょうだい💉

const availableEliteImages = [
${files.map(file => `    '${file}'`).join(',\n')}
];
`;

fs.writeFileSync(outputFile, jsContent, 'utf8');

console.log('💉 elite-enemy-images.js を生成したわよ！');
console.log(`📍 ${outputFile}`);
console.log('');
console.log('次のステップ:');
console.log('1. index.html に <script src="js/elite-enemy-images.js"></script> を追加');
console.log('2. elite-enemy.js から availableEliteImages の定義を削除');
console.log('');
console.log('画像を追加したら、このスクリプトを再実行してね：');
console.log('  node scripts/update-elite-images.js');

