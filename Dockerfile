# Node.jsの実行環境を指定
FROM node:20-slim

# アプリケーションのディレクトリを作成
WORKDIR /app

# package.jsonとpackage-lock.jsonをコピー
COPY package*.json ./

# 依存関係をインストール
RUN npm install

# アプリケーションのソースコードをコピー
COPY . .

# ポート3000を公開
EXPOSE 3000

# ホストからのアクセスを許可するために必要な環境変数を設定
ENV HOSTNAME "0.0.0.0"

# アプリケーションを起動（開発モード）
CMD ["npm", "run", "dev", "--", "--hostname", "0.0.0.0"] 