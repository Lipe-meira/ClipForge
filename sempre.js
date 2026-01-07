const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');
const https = require('https');

// 🔹 accountId vindo por argumento
const accountId = process.argv[2];

if (!accountId) {
  console.error('❌ Informe o accountId. Ex: node sempre.js 1');
  process.exit(1);
}

(async () => {
  let browser;
  let context;

  try {
    browser = await chromium.launch({
      headless: false, // depois pode virar true
      slowMo: 50,

    });

    context = await browser.newContext({
      storageState: `./contas/mindvideo_${accountId}.json`,
      acceptDownloads: true,
    });

    console.log(` Usando conta mindvideo_${accountId}`);

    const page = await context.newPage();

    await page.goto('https://www.mindvideo.ai/pt/', {
      waitUntil: 'domcontentloaded',
      timeout: 60000,
    });

    console.log('Site aberto e logado.');


    console.log(' Feche o navegador quando quiser encerrar a sessão.');
    await page.waitForEvent('close');

  } catch (err) {
    console.error('❌ Erro inesperado:', err);
  } finally {
    if (context) await context.close().catch(() => { });
    if (browser) await browser.close().catch(() => { });
  }
})();
