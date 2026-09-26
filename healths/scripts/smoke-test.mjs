import { chromium, expect } from '@playwright/test';
import assert from 'node:assert/strict';
import { mkdir } from 'node:fs/promises';

const baseURL = process.env.BASE_URL || 'http://127.0.0.1:3000';
await mkdir('artifacts', { recursive: true });
const browser = await chromium.launch({ headless: true, args: ['--no-sandbox'] });
const context = await browser.newContext({ viewport: { width: 1440, height: 1000 }, baseURL });
const page = await context.newPage();
const errors = [];
page.on('pageerror', error => errors.push(error.message));
const log = message => console.log(`✓ ${message}`);
try {
  const response = await context.request.get('/api/knowledge');
  assert.equal(response.status(), 200);
  const library = await response.json();
  assert.ok(library.entities.filter(e => e.kind === 'condition').length >= 20);
  assert.ok(library.entities.filter(e => e.kind === 'symptom').length >= 30);
  assert.ok(library.entities.filter(e => e.kind === 'treatment').length >= 20);
  const ids = new Set(library.entities.map(e => e.id));
  assert.ok(library.relationships.every(r => ids.has(r.sourceId) && ids.has(r.targetId) && r.sourceReference.startsWith('https://')));
  assert.ok(library.entities.every(e => e.sources.length > 0));
  log(`Database library: ${library.entities.length} topics and ${library.relationships.length} referenced relationships`);

  await page.goto('/', { waitUntil: 'networkidle' });
  await page.evaluate(() => document.fonts.ready);
  await expect(page.getByRole('heading', { name: 'Your health knowledge hub' })).toBeVisible();
  await page.screenshot({ path: 'artifacts/home-desktop.png', fullPage: true });
  await page.screenshot({ path: 'artifacts/home-viewport.png' });
  const themeSwitch = page.getByRole('switch', { name: 'Switch from Option A, HealthMesh, to Option B, Clinical Blue' });
  await expect(themeSwitch).toContainText('A · HealthMesh');
  await themeSwitch.click();
  await expect(page.locator('.app-shell')).toHaveAttribute('data-design', 'b');
  const returnSwitch = page.getByRole('switch', { name: 'Switch from Option B, Clinical Blue, to Option A, HealthMesh' });
  await expect(returnSwitch).toHaveAttribute('aria-checked', 'true');
  await expect(returnSwitch).toContainText('B · Clinical Blue');
  await page.screenshot({ path: 'artifacts/option-b-clinical-blue.png', fullPage: true });
  await page.reload({ waitUntil: 'networkidle' });
  await expect(page.locator('.app-shell')).toHaveAttribute('data-design', 'b');
  await expect(page.getByRole('switch', { name: 'Switch from Option B, Clinical Blue, to Option A, HealthMesh' })).toContainText('B · Clinical Blue');
  await page.getByRole('switch', { name: 'Switch from Option B, Clinical Blue, to Option A, HealthMesh' }).click();
  await expect(page.locator('.app-shell')).toHaveAttribute('data-design', 'a');
  await expect(page.getByRole('switch', { name: 'Switch from Option A, HealthMesh, to Option B, Clinical Blue' })).toContainText('A · HealthMesh');
  log('HealthMesh Option A label, accessible switch, and persisted Clinical Blue Option B');
  const heroSearch = page.getByRole('combobox', { name: 'Search conditions, symptoms, treatments...' });
  await heroSearch.fill('asthama');
  await expect(page.getByRole('option', { name: 'Asthma Condition', exact: true })).toBeVisible();
  await heroSearch.press('ArrowDown');
  await heroSearch.press('Enter');
  await expect(page).toHaveURL(/\/topics\/asthma$/);
  await expect(page.getByRole('heading', { name: 'Asthma', exact: true })).toBeVisible();
  log('Typo-tolerant autocomplete and keyboard navigation');

  await page.getByRole('button', { name: 'Save topic', exact: true }).click();
  await expect(page.getByRole('status')).toContainText('Topic saved');
  await page.goto('/saved', { waitUntil: 'networkidle' });
  await expect(page.locator('.topic-card h3')).toContainText('Asthma');
  await page.reload({ waitUntil: 'networkidle' });
  await expect(page.locator('.topic-card h3')).toContainText('Asthma');
  await page.getByRole('button', { name: 'Remove saved topic' }).click();
  await expect(page.getByRole('heading', { name: 'Your next discovery belongs here.' })).toBeVisible();
  log('Saved topics persist through navigation and reload, and can be removed');

  await page.goto('/conditions', { waitUntil: 'networkidle' });
  await expect(page.locator('.topic-card')).toHaveCount(24);
  await page.getByRole('textbox', { name: 'Filter topics' }).fill('asthma');
  await expect(page.locator('.topic-card')).toHaveCount(1);
  await page.getByRole('button', { name: 'Clear filter' }).click();
  await page.getByRole('combobox', { name: 'Filter by body system' }).selectOption('respiratory');
  await expect(page.locator('.topic-card')).toHaveCount(5);
  await page.getByRole('button', { name: 'List view' }).click();
  await expect(page.locator('.topic-list')).toBeVisible();
  log('Library search, body-system filtering, and list/grid view');
  await page.goto('/treatments', { waitUntil: 'networkidle' });
  await page.getByRole('combobox', { name: 'Filter by body system' }).selectOption('respiratory');
  assert.ok(await page.locator('.topic-card').count() > 0);
  log('Treatment filters follow condition-to-body-system connections');

  await page.goto('/explore?topic=asthma', { waitUntil: 'networkidle' });
  await page.screenshot({ path: 'artifacts/graph-desktop.png', fullPage: true });
  const originalCount = await page.locator('.graph-node').count();
  assert.ok(originalCount > 5);
  await page.getByRole('button', { name: 'Zoom in', exact: true }).click();
  await expect(page.locator('.zoom-controls')).toContainText('115%');
  await page.getByRole('button', { name: 'Fit graph to view' }).click();
  const coughNode = page.getByRole('button', { name: /^Cough, Symptom/ });
  const beforeDrag = await coughNode.getAttribute('transform');
  const circle = await coughNode.locator('circle').first().boundingBox();
  await page.mouse.move(circle.x + circle.width / 2, circle.y + circle.height / 2);
  await page.mouse.down();
  await page.mouse.move(circle.x + circle.width / 2 + 35, circle.y + circle.height / 2 + 25, { steps: 5 });
  await page.mouse.up();
  assert.notEqual(await coughNode.getAttribute('transform'), beforeDrag);
  await coughNode.click();
  await expect(page.locator('.inspector-title h2')).toHaveText('Cough');
  await page.getByRole('button', { name: 'Expand connections', exact: true }).click();
  assert.ok(await page.locator('.graph-node').count() > originalCount);
  await page.getByRole('button', { name: 'Make this the center' }).click();
  await expect(page.locator('.graph-breadcrumb strong')).toHaveText('Cough');
  await page.getByRole('button', { name: 'Return to previous graph topic' }).click();
  await expect(page.locator('.graph-breadcrumb strong')).toHaveText('Asthma');
  await page.getByRole('button', { name: 'Reset graph' }).click();
  await page.getByRole('button', { name: 'Collapse all branches' }).click();
  await expect(page.locator('.graph-node')).toHaveCount(1);
  await page.getByRole('button', { name: 'Show branches' }).click();
  await expect(page.locator('.graph-node')).toHaveCount(originalCount);
  log('Graph node dragging, zoom, selection, expansion, collapse, recentering, history, and reset');

  await page.goto('/compare', { waitUntil: 'networkidle' });
  await page.getByRole('combobox', { name: 'First condition' }).selectOption('type-2-diabetes');
  await page.getByRole('combobox', { name: 'Second condition' }).selectOption('hypertension');
  await expect(page.locator('.comparison-table thead')).toContainText('Type 2 diabetes');
  await expect(page.locator('.comparison-table thead')).toContainText('Hypertension');
  assert.ok(await page.locator('.comparison-chip.shared').count() > 0);
  await page.getByRole('button', { name: 'Swap conditions' }).click();
  await expect(page.getByRole('combobox', { name: 'First condition' })).toHaveValue('hypertension');
  await page.screenshot({ path: 'artifacts/compare-desktop.png', fullPage: true });
  log('Condition comparison, shared characteristics, and swap control');

  await page.goto('/body-systems', { waitUntil: 'networkidle' });
  await page.locator('.system-option').filter({ hasText: 'Nervous' }).click();
  await expect(page.locator('.body-feature h2')).toHaveText('Nervous system');
  await expect(page.locator('.topic-card')).toHaveCount(3);
  await page.getByRole('button', { name: 'Treatments & medicines', exact: true }).click();
  assert.ok(await page.locator('.topic-card').count() > 0);
  log('Interactive body systems and related treatment discovery');

  await page.goto('/sources', { waitUntil: 'networkidle' });
  await page.getByRole('textbox', { name: 'Search source references' }).fill('asthma');
  await expect(page.locator('.source-reference')).toHaveCount(1);
  await page.goto('/about', { waitUntil: 'networkidle' });
  await page.getByText('What happens when I save a topic?', { exact: true }).click();
  await expect(page.locator('details[open]')).toContainText('HTTP-only cookie');
  log('Searchable references and working information accordions');

  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/', { waitUntil: 'networkidle' });
  await page.screenshot({ path: 'artifacts/home-mobile.png', fullPage: true });
  assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1));
  await page.getByRole('button', { name: 'Open navigation' }).click();
  await expect(page.locator('.sidebar')).toHaveClass(/sidebar-open/);
  await page.locator('.sidebar').getByRole('link', { name: 'Symptoms', exact: true }).click();
  await expect(page).toHaveURL(/\/symptoms$/);
  await expect(page.locator('.safety-note')).toContainText('does not provide a diagnosis');
  for (const route of ['/explore', '/compare', '/body-systems', '/topics/asthma']) {
    await page.goto(route, { waitUntil: 'networkidle' });
    assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1), `Horizontal overflow on ${route}`);
  }
  log('Mobile navigation, visible safety guidance, and overflow-free responsive routes');
  assert.deepEqual(errors, [], 'Browser JavaScript errors');
  log('No uncaught browser JavaScript errors');
  console.log('\nAll health knowledge explorer smoke tests passed.');
} catch (error) {
  await page.screenshot({ path: 'artifacts/test-failure.png', fullPage: true });
  console.error(error);
  process.exitCode = 1;
} finally {
  await browser.close();
}
