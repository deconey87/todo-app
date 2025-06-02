#!/usr/bin/env node

/**
 * Puppeteer/Chromiumの動作確認用スクリプト
 * devcontainer環境でブラウザが正常に起動するかテストします
 */

import puppeteer from 'puppeteer';

async function testPuppeteer() {
  console.log('🚀 Puppeteer/Chromiumの動作テストを開始します...');
  
  try {
    // ブラウザを起動
    console.log('📱 ブラウザを起動中...');
    const browser = await puppeteer.launch({
      headless: true,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-accelerated-2d-canvas',
        '--no-first-run',
        '--no-zygote',
        '--single-process',
        '--disable-gpu'
      ]
    });

    // 新しいページを作成
    console.log('📄 新しいページを作成中...');
    const page = await browser.newPage();
    
    // シンプルなHTMLページに移動
    console.log('🌐 テストページに移動中...');
    await page.setContent(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Puppeteer Test</title>
        </head>
        <body>
          <h1>Puppeteer動作テスト成功！</h1>
          <p>現在時刻: ${new Date().toISOString()}</p>
        </body>
      </html>
    `);

    // ページタイトルを取得
    const title = await page.title();
    console.log(`📋 ページタイトル: ${title}`);

    // スクリーンショットを撮影
    console.log('📸 スクリーンショットを撮影中...');
    await page.screenshot({ 
      path: '/tmp/puppeteer-test.png',
      fullPage: true 
    });
    console.log('💾 スクリーンショットを /tmp/puppeteer-test.png に保存しました');

    // ブラウザを閉じる
    await browser.close();
    
    console.log('✅ Puppeteer/Chromiumの動作テストが正常に完了しました！');
    console.log('🎉 Claude Computer Useのブラウザアクションが使用可能です');
    
  } catch (error) {
    console.error('❌ Puppeteer/Chromiumの動作テストでエラーが発生しました:');
    console.error(error.message);
    console.error('\n🔧 トラブルシューティング:');
    console.error('1. コンテナを再ビルドしてください: docker-compose build');
    console.error('2. 依存関係が正しくインストールされているか確認してください');
    console.error('3. セキュリティ設定が正しく適用されているか確認してください');
    process.exit(1);
  }
}

// スクリプトが直接実行された場合のみテストを実行
if (import.meta.url === `file://${process.argv[1]}`) {
  testPuppeteer();
}

export { testPuppeteer };