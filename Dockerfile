# ベースイメージとして、Node.js LTSバージョンを含むDev Containerイメージを使用
# Node.js 22 LTSを想定
FROM mcr.microsoft.com/devcontainers/typescript-node:22

# コンテナ内の作業ディレクトリを設定
WORKDIR /workspaces/todo-app

# 必要なツールをインストール (PostgreSQLクライアント、netcat、Chromium依存関係)
# rootユーザーに切り替えてインストールし、nodeユーザーに戻る
USER root
RUN apt-get update && \
    apt-get install -y \
        postgresql-client \
        netcat-openbsd \
        # Chromium/Puppeteer用の依存関係
        chromium \
        libnspr4 \
        libnss3 \
        libatk-bridge2.0-0 \
        libdrm2 \
        libxkbcommon0 \
        libxcomposite1 \
        libxdamage1 \
        libxrandr2 \
        libgbm1 \
        libxss1 \
        libasound2 \
        libatspi2.0-0 \
        libgtk-3-0 \
        libgdk-pixbuf2.0-0 \
        libxfixes3 \
        libcairo-gobject2 \
        libpango-1.0-0 \
        libcairo2 \
        libglib2.0-0 \
        fonts-liberation \
        libappindicator3-1 \
        xdg-utils && \
    rm -rf /var/lib/apt/lists/*

# Puppeteerがシステムのchromiumを使用するように環境変数を設定
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true
ENV PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium

USER node