# ベースイメージとして、Node.js LTSバージョンを含むDev Containerイメージを使用
# Node.js 22 LTSを想定
FROM mcr.microsoft.com/devcontainers/typescript-node:22

# コンテナ内の作業ディレクトリを設定
WORKDIR /workspaces/todo-app

# 必要なツールをインストール (PostgreSQLクライアントとnetcat)
# rootユーザーに切り替えてインストールし、nodeユーザーに戻る
USER root
RUN apt-get update && \
    apt-get install -y postgresql-client netcat-openbsd && \
    rm -rf /var/lib/apt/lists/*
USER node