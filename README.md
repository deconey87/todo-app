# TODO アプリケーション

これは [Next.js](https://nextjs.org) を利用して構築されたTODOアプリケーションです。

## VSCode Devcontainerでの起動方法

このプロジェクトはVSCodeのDevcontainerを利用して開発環境を構築することを推奨しています。

### 前提条件

*   [Docker Desktop](https://www.docker.com/products/docker-desktop/) がインストールされていること。
*   [Visual Studio Code](https://code.visualstudio.com/) がインストールされていること。
*   VSCode拡張機能「[Remote - Containers](https://marketplace.visualstudio.com/items?itemName=ms-vscode-remote.remote-containers)」がインストールされていること。

### 起動手順

1.  このリポジトリをローカルにクローンします。
    ```bash
    git clone https://your-repository-url/todo-app.git
    cd todo-app
    ```
2.  VSCodeでクローンしたプロジェクトフォルダを開きます。
3.  VSCodeの左下にある緑色のアイコンをクリックするか、コマンドパレット（`Ctrl+Shift+P` または `Cmd+Shift+P`）を開いて `Remote-Containers: Reopen in Container` を選択します。
4.  コンテナのビルドと起動が完了するまで待ちます。
5.  コンテナ内のターミナルで以下のコマンドを実行して開発サーバーを起動します。
    ```bash
    npm run dev
    ```
6.  ブラウザで [http://localhost:3000](http://localhost:3000) を開くとアプリケーションが表示されます。

### 初期データについて

開発環境を起動すると、初期データとしていくつかのタスクリストとタスクが自動的に投入されます。（もし、初期データ投入スクリプトやマイグレーションに関する情報があれば、ここに追記してください。例えば、`docker-compose.yml` でDBサービスが定義されており、初期化スクリプトが実行される場合など。）