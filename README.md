# semaruebi.github.io
GIEE400DB

## 📋 プロジェクト概要
原神の精鋭狩りRTA（Real Time Attack）のための知識共有プラットフォームなのよ。
ユーザーはルートごとのコツや動画、画像を投稿できて、コメントで議論もできるわ。

## 🛠️ 技術スタック
- **Frontend**: HTML5, CSS3, Vanilla JavaScript (No Framework)
- **Backend**: Google Apps Script (GAS)
- **Database**: Google Spreadsheet
- **Storage**: Google Drive（画像保存用）
- **Hosting**: GitHub Pages

## 📁 ファイル構造（v3.0 - リファクタリング後）

```
gieedb/
├── index.html              # メインHTML
├── config.js              # 設定ファイル（GAS API URL等）
├── js/                    # JavaScript分割版
│   ├── config.js         # 設定（GAS API URL、リトライ設定等）
│   ├── utils.js          # ユーティリティ関数（エスケープ、デバウンス、トースト等）
│   ├── theme.js          # テーマ管理（テーマ切り替え、読み込み）
│   ├── api.js            # API通信（データ取得、コメント送信、問い合わせ等）
│   ├── modal.js          # モーダル関連（画像、ルート詳細、About、問い合わせ）
│   ├── search.js         # 検索機能（サジェスト、フィルタリング、タグ検索）
│   ├── image.js          # 画像プレビュー・ドラッグ&ドロップ
│   ├── ui.js             # UI操作（サイドバー、ホーム、フィルタ、いいね、コメント等）
│   ├── card.js           # カード生成（HTML生成、コメントツリー等）
│   ├── post.js           # 投稿関連（投稿、編集、削除、フォーム設定等）
│   └── main.js           # 初期化（window.onload、ドラッグ&ドロップ設定）
├── css/                   # CSS分割版
│   ├── variables.css     # CSS変数とテーマ定義
│   ├── base.css          # ベーススタイル（body、スクロールバー、トースト等）
│   ├── layout.css         # レイアウト（header、sidebar、navigation等）
│   ├── components.css    # コンポーネント（card、badge、button、form等）
│   ├── modal.css         # モーダル関連
│   └── responsive.css    # レスポンシブ（メディアクエリ）
├── old/                   # 旧ファイル（バックアップ）
│   ├── script.js
│   └── style.css
├── README.md             # このファイル
└── handoff.md            # 開発用ドキュメント
```

## 🔧 設定・環境

### GAS API URL設定
`js/config.js`でGAS API URLを設定します：
```javascript
const CONFIG = {
    GAS_API_URL: "https://script.google.com/macros/s/YOUR_SCRIPT_ID/exec",
    // ... その他の設定
};
```

### 外部依存関係
- **Font Awesome 6.4.0** (CDN) - アイコン表示
- **Google Fonts** - Kiwi Maru, M PLUS Rounded 1c, Zen Maru Gothic
- **Twitter Widgets** (CDN) - ツイート埋め込み

### ローカルストレージ使用項目
- `rta_theme` - 選択中のテーマ（dark/light/sigewinne）
- `rta_liked_posts` - いいね済み投稿ID配列
- `rta_liked_comments` - いいね済みコメントID配列

## 🗄️ データ構造

### Google Spreadsheet（想定構造）
- **routesシート**: 地域・ルート情報（region, route, imageUrl, description）
- **postsシート**: 投稿データ（id, region, route, content, imageUrl, tags, likes, timestamp）
- **commentsシート**: コメントデータ（id, postId, parentId, content, likes, timestamp）

### タグシステム
- **必須タグ（レギュレーション）**: NPuI, PuA, PuI, 全般
- **必須タグ（Cost）**: 制限なし、低凸、Cost全般
- **オプションタグ**: 誘導、弓起動、処理法、位置調整、コツ、注意点
- **自由タグ**: 最大2つ（ユーザー入力）

## 🚀 デプロイ方法

### GitHub Pages
1. リポジトリをGitHubにプッシュ
2. Settings > Pagesでソースブランチを選択
3. ルートディレクトリを選択して保存
4. `https://[username].github.io/[repository-name]/`でアクセス可能

### GAS側の設定
- GASプロジェクトでWebアプリとして公開（実行ユーザー: 自分、アクセス権限: 全員）
- 公開URLを`js/config.js`の`CONFIG.GAS_API_URL`に設定

## 💡 主要機能の実装詳細

### テーマ切り替え
- `cycleTheme()`: dark → light → sigewinne → darkの順で循環
- `localStorage`に保存され、次回訪問時に復元

### 検索・フィルタリング
- 全文検索: 投稿内容、ルート名、地域名、タグを対象
- タグサジェスト: 既存タグからオートコンプリート表示
- サイドバー: 地域・ルートで階層的にフィルタリング

### 画像アップロード
- 最大4枚、各2MB以下
- Base64エンコードしてGASに送信
- GAS側でGoogle Driveに保存し、公開URLを返却

### コメント機能
- スレッド形式（`parentId`で階層管理）
- 再帰的に`renderCommentTree()`で表示
- 各コメントに個別のいいね機能

### レスポンシブ対応
- ブレークポイント: 900px
- スマホ: サイドバーは左からのオーバーレイ、スワイプで閉じる
- PC: 常時表示の2カラムレイアウト

## ⚠️ 注意事項

1. **CORS制限**: GAS APIは`mode: "no-cors"`で送信しているため、レスポンスの詳細なエラーハンドリングが困難
2. **レート制限**: 連続で更新ボタンを押すとGAS側でエラーになる可能性あり（エラーメッセージで注意喚起済み）
3. **画像サイズ**: 2MB制限はフロントエンドのみ。GAS側でも検証推奨
4. **セキュリティ**: 削除パスワードは平文で送信（GAS側で検証）

## 🔮 今後の拡張候補

- ユーザー認証機能
- 投稿の編集機能（実装済み）
- 画像のドラッグ&ドロップ対応（実装済み）
- 投稿の並び替え（日付、いいね数など）
- エクスポート機能（CSV/JSON）

## 🔄 改修履歴

### v3.0 - 大規模リファクタリング
- ✅ JavaScriptファイルを10個に分割（utils, theme, api, modal, search, image, ui, card, post, main）
- ✅ CSSファイルを6個に分割（variables, base, layout, components, modal, responsive）
- ✅ コードの可読性と保守性を大幅に向上
- ✅ ファイル構造の整理と最適化

### v2.0 - 包括的改修
- ✅ GAS API URLを`config.js`に分離（環境変数化）
- ✅ XSS対策の強化
- ✅ リトライ機能の実装
- ✅ アクセシビリティ改善
- ✅ パフォーマンス改善
- ✅ トースト通知システムの実装

---
