# semaruebi.github.io
GIEE400DB

## 📋 プロジェクト概要
原神の精鋭狩りRTA（Real Time Attack）のための知識共有プラットフォームなのよ💉
ルートごとのコツや動画、画像を投稿して、コメントで議論できるわ。みんなの健康管理はウチが担当するのよ！

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
`js/config.js`でGAS API URLを設定するのよ：
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
1. リポジトリをGitHubにプッシュするのよ
2. Settings > Pagesでソースブランチを選択してちょうだい
3. ルートディレクトリを選択して保存するの
4. `https://[username].github.io/[repository-name]/`でアクセスできるわよ

### GAS側の設定
- GASプロジェクトでWebアプリとして公開するのよ（実行ユーザー: 自分、アクセス権限: 全員）
- 公開URLを`js/config.js`の`CONFIG.GAS_API_URL`に設定してね

## 💡 主要機能の実装詳細

### テーマ切り替え
- `cycleTheme()`: 夜の診療所 → シグウィンデイタイム → おシグテーマ → 夜の診療所の順で循環するのよ
- `localStorage`に保存されるから、次に来た時も同じテーマで迎えるわ

### 検索・フィルタリング
- 全文検索: 投稿内容、ルート名、地域名、タグを対象に探すのよ
- タグサジェスト: 既存タグからオートコンプリート表示してあげるわ
- サイドバー: 地域・ルートで階層的にフィルタリングできるの

### 画像アップロード
- 最大4枚、各2MB以下なのよ。転ばないようにね
- Base64エンコードしてGASに送信するわ
- GAS側でGoogle Driveに保存して、公開URLを返却してくれるの

### コメント機能
- スレッド形式（`parentId`で階層管理）なのよ
- 再帰的に`renderCommentTree()`で表示してるわ
- 各コメントに個別のいいね機能があるの

### レスポンシブ対応
- ブレークポイント: 900pxなのよ
- スマホ: サイドバーは左からのオーバーレイで、スワイプで閉じられるわ
- PC: 常時表示の2カラムレイアウトよ

## ⚠️ 注意事項

1. **CORS制限**: GAS APIは`mode: "no-cors"`で送信してるから、レスポンスの詳細なエラーハンドリングが難しいのよ
2. **レート制限**: 連続で更新ボタンを押すとGAS側でエラーになっちゃうわ。力を抜いて、リラックスするのよ（エラーメッセージで注意喚起済み）
3. **画像サイズ**: 2MB制限はフロントエンドのみなの。GAS側でも検証を推奨するわ
4. **セキュリティ**: 削除パスワードは平文で送信してるのよ（GAS側で検証）

## 🔮 今後の拡張候補

- ユーザー認証機能を追加したいわね
- 投稿の編集機能（実装済みなのよ✨）
- 画像のドラッグ&ドロップ対応（実装済みなのよ✨）
- 投稿の並び替え（日付、いいね数など）も欲しいところね
- エクスポート機能（CSV/JSON）があると便利よね

## 🔄 改修履歴

### v3.1 - コード最適化とシグウィン口調化 💉
- ✅ 重複コードを削減して、健康なコードベースにしたのよ
- ✅ 共通関数の抽出で保守性を向上させたわ
- ✅ ユーザー向けメッセージを全部シグウィン口調に統一したの
- ✅ リンターエラー0件達成なのよ！

### v3.0 - 大規模リファクタリング
- ✅ JavaScriptファイルを10個に分割したのよ（utils, theme, api, modal, search, image, ui, card, post, main）
- ✅ CSSファイルを6個に分割したわ（variables, base, layout, components, modal, responsive）
- ✅ コードの可読性と保守性を大幅に向上させたの
- ✅ ファイル構造の整理と最適化をしたわよ

### v2.0 - 包括的改修
- ✅ GAS API URLを`config.js`に分離したのよ（環境変数化）
- ✅ XSS対策を強化したわ
- ✅ リトライ機能を実装したの
- ✅ アクセシビリティを改善したわよ
- ✅ パフォーマンスを改善したのよ
- ✅ トースト通知システムを実装したわ

---
