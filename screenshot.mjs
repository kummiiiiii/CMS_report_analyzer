import puppeteer from 'puppeteer-core';
import { existsSync, mkdirSync, readdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const outDir = join(__dirname, 'temporary screenshots');
if (!existsSync(outDir)) mkdirSync(outDir);

const url   = process.argv[2] || 'http://localhost:3000';
const label = process.argv[3] ? `-${process.argv[3]}` : '';

const existing = readdirSync(outDir).filter(f => f.endsWith('.png'));
const next = existing.length + 1;
const filename = `screenshot-${next}${label}.png`;
const outPath  = join(outDir, filename);

const browser = await puppeteer.launch({
  headless: 'new',
  executablePath: (() => {
    // Try common locations
    const paths = [
      'C:/Program Files/Google/Chrome/Application/chrome.exe',
      'C:/Program Files (x86)/Google/Chrome/Application/chrome.exe',
      'C:/Users/zhanl/.cache/puppeteer/chrome/win64-131.0.6778.204/chrome-win64/chrome.exe',
      'C:/Users/nateh/.cache/puppeteer/chrome/win64-131.0.6778.204/chrome-win64/chrome.exe',
    ];
    for (const p of paths) { if (existsSync(p)) return p; }
    return undefined; // let puppeteer find it
  })(),
  args: ['--no-sandbox', '--disable-setuid-sandbox'],
});

const page = await browser.newPage();
await page.setViewport({ width: 1440, height: 900 });
await page.goto(url, { waitUntil: 'networkidle0', timeout: 15000 });
await page.screenshot({ path: outPath, fullPage: false });
await browser.close();

console.log(`Screenshot saved: temporary screenshots/${filename}`);
