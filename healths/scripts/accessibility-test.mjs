import { chromium } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { writeFile, mkdir } from 'node:fs/promises';
const browser = await chromium.launch({ args: ['--no-sandbox'] });
const context = await browser.newContext({ viewport: { width: 1440, height: 1000 } });
const page = await context.newPage();
const report = [];
await mkdir('artifacts', { recursive: true });
const baseURL = process.env.BASE_URL || 'http://127.0.0.1:3000';
const routes = ['/', '/conditions', '/explore', '/topics/asthma', '/compare', '/body-systems', '/sources', '/about'];
for (const design of ['a', 'b']) {
  await page.goto(baseURL, { waitUntil: 'networkidle' });
  if (design === 'b') await page.getByRole('switch', { name: 'Switch from Option A, HealthMesh, to Option B, Clinical Blue' }).click();
  for (const route of routes) {
    await page.goto(`${baseURL}${route}`, { waitUntil: 'networkidle' });
    await page.evaluate(() => document.fonts.ready);
    const result = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa']).analyze();
    report.push({ design, route, violations: result.violations.map(v => ({ id: v.id, impact: v.impact, description: v.description, nodes: v.nodes.map(n => ({ target: n.target, html: n.html, failureSummary: n.failureSummary })) })) });
    console.log(`Option ${design.toUpperCase()}`, route, result.violations.map(v => `${v.id}: ${v.nodes.length} elements`).join(', ') || 'PASS');
  }
}
await writeFile('artifacts/accessibility-report.json', JSON.stringify(report, null, 2));
await browser.close();
if (report.some(r => r.violations.length)) process.exitCode = 1;
