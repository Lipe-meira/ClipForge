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



    await page.waitForTimeout(2000);

    // 1️⃣ Abrir aba Imagem para Vídeo
    await page.getByRole('link', { name: 'Imagem para Vídeo' }).click();
    await page.waitForURL('**/pt/image-to-video/**', { timeout: 30000 });
    console.log('➡️ Aba Imagem para Vídeo aberta');

    await page.waitForTimeout(1500);

    // 2️⃣ Abrir selecao IA
    const currentModel = page.locator('.ant-select-selection-item').first();
    await currentModel.waitFor({ state: 'visible' });
    await currentModel.click();

    await page.waitForTimeout(600);

    // 3️⃣ Selecionar Sora 2 
    const soraOption = page.locator('div[data-value="154"]');
    await soraOption.waitFor({ state: 'visible' });
    await soraOption.click();

    console.log('🤖 Modelo selecionado: Sora 2 Free (Beta)');
    await page.waitForTimeout(1000);

    const roteiro =
      'testeeeeeeeeee';

    const textarea = await page.waitForSelector(
      'textarea[placeholder^="De acordo com as regras da OpenAI"]',
      { timeout: 15000 }
    );

    await page.evaluate(
      ({ textarea, roteiro }) => {
        const setter = Object.getOwnPropertyDescriptor(
          HTMLTextAreaElement.prototype,
          'value'
        ).set;

        setter.call(textarea, roteiro);
        textarea.dispatchEvent(new Event('input', { bubbles: true }));
        textarea.dispatchEvent(new Event('change', { bubbles: true }));
      },
      { textarea, roteiro }
    );

    console.log(' Roteiro inserido corretamente');

    // 5️⃣ Anexar imagem
    const imagePath = 'C:/n8n/files/uploads/produto.png'; //add dynamic path after tests
    const fileInput = page.locator('input[type="file"]');

    await fileInput.waitFor({ state: 'attached' });
    await fileInput.setInputFiles(imagePath);

    console.log('🖼️ Imagem anexada com sucesso');

    // 🔎 Capturar vídeos existentes (exemplo / anteriores)
    const existingVideoSrcs = await page.evaluate(() => {
      return Array.from(document.querySelectorAll('video'))
        .map(v => v.src)
        .filter(Boolean);
    });

    console.log('📼 Vídeos existentes antes da geração:', existingVideoSrcs);

    // 6️⃣ Esperar botão Criar entrar no ESTADO REAL de clique
    console.log('⏳ Aguardando botão Criar ficar realmente clicável...');

    await page.waitForFunction(() => {
      const btn = [...document.querySelectorAll('button')]
        .find(b => b.innerText.trim() === 'Criar');

      if (!btn) return false;

      const cls = btn.className || '';
      return cls.includes('cursor-pointer') && cls.includes('bg-white');
    }, { timeout: 60000 });

    console.log('🟢 Botão Criar pronto para clique');

    // 7️⃣ Clique REAL (React-safe)
    await page.evaluate(() => {
      const btn = [...document.querySelectorAll('button')]
        .find(b => b.innerText.trim() === 'Criar');

      if (!btn) throw new Error('Botão Criar não encontrado');

      btn.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true }));
      btn.dispatchEvent(new MouseEvent('mousedown', { bubbles: true }));
      btn.dispatchEvent(new MouseEvent('mouseup', { bubbles: true }));
      btn.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    });

    console.log('🎬 Clique em Criar ACEITO pelo React');

    // 8️⃣ Esperar surgir NOVO vídeo (ignora exemplo)
    console.log('⏳ Aguardando NOVO vídeo ser gerado...');

    let generatedVideoUrl = null;

    while (!generatedVideoUrl) {
      generatedVideoUrl = await page.evaluate(existing => {
        const videos = Array.from(document.querySelectorAll('video'));

        const v = videos.find(v =>
          v.src &&
          !existing.includes(v.src) &&
          (v.src.includes('/files/') || v.src.includes('/middle/')) &&
          v.readyState === 4 &&
          v.duration > 0 &&
          !isNaN(v.duration)
        );

        return v ? v.src : null;
      }, existingVideoSrcs);

      if (!generatedVideoUrl) {
        console.log('⏳ Ainda gerando...');
        await page.waitForTimeout(5000);
      }
    }

    console.log('🎥 NOVO vídeo gerado:', generatedVideoUrl);


    console.log(' Feche o navegador quando quiser encerrar a sessão.');
    // await page.waitForEvent('close');

  } catch (err) {
    console.error('❌ Erro inesperado:', err);
  } finally {
    if (context) await context.close().catch(() => { });
    if (browser) await browser.close().catch(() => { });
  }
})();
