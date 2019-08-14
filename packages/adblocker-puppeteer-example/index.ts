import { fetchLists, fetchResources, PuppeteerBlocker, Request } from '@cliqz/adblocker-puppeteer';
import fetch from 'node-fetch';
import puppeteer from 'puppeteer';

// Polyfill fetch API for Node.js environment
// @ts-ignore
global.fetch = fetch;

/**
 * Initialize the adblocker using lists of filters and resources. It returns a
 * Promise resolving on the `Engine` that we will use to decide what requests
 * should be blocked or altered.
 */
async function loadAdblocker(): Promise<PuppeteerBlocker> {
  console.log('Fetching resources...');
  return Promise.all([fetchLists(), fetchResources()]).then(([responses, resources]) => {
    console.log('Initialize adblocker...');
    const deduplicatedLines = new Set();
    for (let i = 0; i < responses.length; i += 1) {
      const lines = responses[i].split(/\n/g);
      for (let j = 0; j < lines.length; j += 1) {
        deduplicatedLines.add(lines[j]);
      }
    }
    const deduplicatedFilters = Array.from(deduplicatedLines).join('\n');

    let t0 = Date.now();
    const engine = PuppeteerBlocker.parse(deduplicatedFilters, {
      enableCompression: true,
    });
    let total = Date.now() - t0;
    console.log('parsing filters', total);

    t0 = Date.now();
    engine.updateResources(resources, '' + resources.length);
    total = Date.now() - t0;
    console.log('parsing resources', total);

    t0 = Date.now();
    const serialized = engine.serialize();
    total = Date.now() - t0;
    console.log('serialization', total);
    console.log('size', serialized.byteLength);

    t0 = Date.now();
    const deserialized = PuppeteerBlocker.deserialize(serialized);
    total = Date.now() - t0;
    console.log('deserialization', total);

    return deserialized as PuppeteerBlocker;
  });
}

(async () => {
  const engine = await loadAdblocker();
  const browser = await puppeteer.launch({
    defaultViewport: null,
    headless: false,
  });

  const page = await browser.newPage();
  await engine.enableBlockingInPage(page);

  engine.on('request-blocked', (request: Request) => {
    console.log('blocked', request.url);
  });

  engine.on('request-redirected', (request: Request) => {
    console.log('redirected', request.url);
  });

  engine.on('request-whitelisted', (request: Request) => {
    console.log('whitelisted', request.url);
  });

  engine.on('csp-injected', (request: Request) => {
    console.log('csp', request.url);
  });

  engine.on('script-injected', (script: string, url: string) => {
    console.log('script', script.length, url);
  });

  engine.on('style-injected', (style: string, url: string) => {
    console.log('style', style.length, url);
  });

  await page.goto('https://www.mangareader.net/');
})();