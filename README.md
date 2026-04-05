# Task Avatar AI

Task Avatar AI は、ユーザーと対話しながらタスクを支援する3Dアバターインターフェースを提供するプロジェクトです。
音声入力とLLM（大規模言語モデル）を活用し、3Dアバターがユーザーに応じた案内や対話を行います。

## プロジェクトの経緯

このプロジェクトは段階的に機能拡張を行ってきました：
1. **サーバー・クライアント基盤の構築**：Node.js / Expressによるバックエンドと、Vite / Vueベースのフロントエンド基盤の実装。
2. **LLMと動的UIの統合**：プロンプト管理とフロントエンドUIを結合し、タスク案内システムを構築。
3. **アバターと音声合成の導入**：3Dアバターの描画調整、および Voicevox 連携によるローカル音声合成機能を実装。
4. **管理システムの追加**：アバター設定やタスクプロンプト設定をUIから柔軟に行える Admin パネルを導入。

## 主な機能

* **音声認識 (STT)**: Web Speech API を利用した音声入力。
* **アバター表示・アニメーション**: `virtual-avatar` を利用し、VRMモデルの描画とアニメーション（VRMA）再生に対応。
  * ※VRoid公式サンプルモデルなどが利用可能です。
* **音声合成 (TTS)**: Docker 上で動作する VOICEVOX エンジンを利用し、ローカル環境での音声合成を行います。
* **LLM連携**: Google Gemini 2.5 Flash Lite と連携し、プロンプトベースの応答を行います。（※OpenAI GPT-4 Turbo もシステムとしてはサポートしていますが、現状は動作未確認の実験的機能となります）

## ⚠️ 注意事項・制限事項

* **音声入力の制限**: Web Speech API のマイク利用の仕様およびセキュリティ制限上、現状は **Google Chrome ブラウザによる `localhost` 接続時のみ** 音声入力（マイク）が正常に機能します。
* Voicevoxエンジンの実行にはローカルの Docker 環境が必要です。

## 前提条件

* Node.js (v24推奨 / `.nvmrc` 準拠)
* Docker および Docker Compose (VOICEVOXエンジン起動用)
* Google Chrome (マイクを使用した音声認識用)

## セットアップと起動方法

1. **環境変数の設定**
   `server` ディレクトリ内に `.env` ファイルを作成し、APIキーを設定してください。

   ```env
   # server/.env
   GOOGLE_GENERATIVE_AI_API_KEY=your_gemini_api_key_here

   # (オプション・実験的) OpenAI を使用する場合
   # OPENAI_API_KEY=your_openai_api_key_here
   ```

2. **依存関係のインストールと起動**
   プロジェクトルートにある `start-dev.sh` を実行することで、依存関係のインストールと全サーバー（Voicevox, Backend, Frontend）の起動が自動で行われます。

   ```bash
   chmod +x start-dev.sh
   ./start-dev.sh
   ```

3. **アクセス**
   起動が完了したら、ブラウザから以下のURLにアクセスしてください。
   * **ユーザー画面 (タスク・対話UI)**: [http://localhost:5173](http://localhost:5173)
   * **管理画面 (プロンプト・アバター等の管理)**: [http://localhost:5173/admin.html](http://localhost:5173/admin.html)

## ディレクトリ構成

* `client/`: フロントエンド (Vite, Vue, Vanilla JS, virtual-avatar)
  * `public/assets/`: VRMモデル (`models/`) とアニメーション (`animations/`) の保管場所
  * `src/admin/`: 管理画面のソースコード
* `server/`: バックエンド (Express, SQLite, LLM API連携)
  * `src/db/`: データベース初期化と初期シードデータ
  * `src/prompts/`: デフォルトのプロンプトテキスト設定

## ライセンス

[MIT License](LICENSE)
