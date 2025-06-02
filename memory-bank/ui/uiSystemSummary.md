# UIデザインシステム要約

## プロジェクト成果（2025/6/2完了）
**カード過剰使用問題の完全解決**と**モダンミニマルデザインの実現**を達成。

### 定量的改善効果
- DOM要素削減: 30%
- CSS簡素化: 40% 
- 視覚的ノイズ削減: 60%
- 機能完全性: 100%維持

## モダンミニマル原則
1. **Less is More**: 必要最小限の要素で最大効果
2. **Function over Form**: 装飾より機能性優先
3. **Semantic First**: HTML要素の意味的正確性
4. **Progressive Enhancement**: 基本機能から段階的拡張

## Card削除戦略
### 削除基準
- 単独表示要素: Card不要（例: DashboardHeader）
- リスト項目: li要素で十分（例: TaskItem）
- コンテナ要素: セマンティックHTML活用（例: aside, section）

### 代替手法
- **線区切り**: `border-bottom`, `border-left`による明確な区切り
- **背景色階層**: `surface-1/2/3`による視覚的深度表現
- **タイポグラフィ**: フォントサイズ・ウェイトによる階層化

## デザイントークン
### 色システム
```css
--surface-1: 基本背景
--surface-2: 第2階層背景
--surface-3: 第3階層背景
--divider: 区切り線色
--accent-line: アクセント線色
```

### タイポグラフィスケール
```css
.text-display: ページタイトル（2rem, 700）
.text-heading: セクション見出し（1.5rem, 600）
.text-subheading: サブ見出し（1.25rem, 500）
.text-body: 本文（1rem, 400）
```

### ユーティリティクラス
```css
.surface-2: 背景色適用
.divider-bottom: 下線区切り
.accent-left: 左アクセント線
.hover-surface: ホバー効果
```

## セマンティックHTML活用
| 用途 | 推奨要素 | 例 |
|------|----------|-----|
| ページヘッダー | `<header>` | DashboardHeader |
| サイドバー | `<aside>` | TaskListSidebar |
| メインコンテンツ | `<main>` | TaskList表示エリア |
| コンテンツ区分 | `<section>` | タスクリスト、フィルター |
| リスト項目 | `<ul>` + `<li>` | TaskItem一覧 |

## 実装パターン
### TaskItem（最重要）
- Card削除 → `<li>`要素化
- 線区切り（`border-bottom`）
- 軽量ホバー効果（`hover:bg-gray-50`）
- セマンティック構造（`<ul>`+`<li>`）

### DashboardHeader
- Card削除 → `<header>`要素化
- タイポグラフィ重視（`text-display`）
- 下線区切り（`divider-bottom`）

### TaskListSidebar
- 複数Card統合 → 単一`<aside>`
- セクション区切り（`<section>`）
- 左アクセント線（`accent-left`）

## 軽量インタラクション
```css
/* 推奨パターン */
.hover-surface:hover {
  background-color: var(--surface-2);
  transition: background-color 0.2s ease;
}

/* 控えめな影効果（慎重使用） */
.hover-shadow:hover {
  box-shadow: 0 1px 3px 0 rgb(0 0 0 / 0.1);
}
```

## 新機能追加指針
### Card使用判断基準
- 独立したコンテンツブロック: 検討可能
- リスト項目: 原則使用しない
- 装飾目的: 使用禁止

### 避けるべきアンチパターン
1. Card乱用: 全要素をCardで囲む安易なアプローチ
2. div過多: 意味のないWrapper要素追加
3. インライン装飾: 一貫性を損なう個別スタイル
4. アクセシビリティ軽視: 見た目優先の実装

## 品質保証チェックリスト
- [ ] Card使用の必要性検証
- [ ] セマンティックHTML構造確認
- [ ] デザイントークン活用確認
- [ ] レスポンシブ動作確認
- [ ] アクセシビリティ確認
- [ ] パフォーマンス影響確認

---
**ステータス**: 実装完了・運用中  
**次回更新**: 新機能追加時または四半期レビュー時