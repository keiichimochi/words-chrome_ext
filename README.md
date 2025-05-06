# English Learner for X/GitHub

Chrome拡張機能で、XやGitHubの英語コンテンツ学習を支援するツールナリ！

## 機能

- 英語テキストの日本語翻訳
- 頻出単語の抽出
- 単語の定義と例文の表示（Gemini API使用）

## インストール方法

1. Google AI Studio ([https://aistudio.google.com/app/apikey](https://aistudio.google.com/app/apikey)) でAPIキーを取得するナリ！
2. Chromeを開いて `chrome://extensions` にアクセスするナリ！
3. 右上の「デベロッパーモード」をオンにするナリ！
4. 「パッケージ化されていない拡張機能を読み込む」ボタンをクリックして、このリポジトリのフォルダを選択するナリ！
5. 拡張機能のアイコンをクリックして、オプションページでAPIキーを設定するナリ！

## 使用方法

1. XやGitHubなどで英語のテキストをコピーするナリ！
2. Chromeの拡張機能アイコンをクリックして、「English Learner for X/GitHub」のポップアップを開くナリ！
3. テキストエリアにコピーした英語を貼り付けて、「Process Text」ボタンをクリックするナリ！
4. 翻訳、頻出単語リストが表示されるナリ！
5. 頻出単語リストの単語をクリックすると、その単語の定義と例文が表示されるナリ！

## 技術スタック

- Chrome Extension Manifest V3
- Gemini API (text-generationモデル)
- HTML/CSS/JavaScript

## ライセンス

MIT License 