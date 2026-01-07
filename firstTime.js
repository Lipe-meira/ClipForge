const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

// número da conta vem por argumento.
const accountId = process.argv[2];

if (!accountId) {
  console.error('❌ Informe o número da conta. Ex: node firstTime.js 1');
  process.exit(1);
}

(async () => {
  const contasDir = path.resolve(__dirname, 'contas');
  if (!fs.existsSync(contasDir)) {
    fs.mkdirSync(contasDir, { recursive: true });
  }

  const storagePath = path.join(
    contasDir,
    `mindvideo_${accountId}.json`
  );

  console.log(`🧠 Salvando sessão da conta: ${accountId}`);
  console.log(`📁 Arquivo: ${storagePath}`);

  const browser = await chromium.launch({
    headless: false,
    slowMo: 50,
    
  });

  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 },
  });

  const page = await context.newPage();

  await page.goto('https://www.mindvideo.ai/pt/', {
    waitUntil: 'domcontentloaded',
    timeout: 60_000,
  });

  console.log('🔐 Faça login MANUALMENTE AGORA');
  console.log('⏳ Após finalizar o login, AGUARDE 15 segundos');
  console.log('❌ NÃO feche o navegador');

  await page.waitForTimeout(15_000);

  console.log('💾 Salvando sessão...');
  await context.storageState({
    path: storagePath,
  });

  console.log('✅ Sessão salva com sucesso!');
  console.log(`📁 Conta ${accountId} salva em ${storagePath}`);

  // await browser.close();
})();
