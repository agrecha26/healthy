import postcss from 'postcss';
import { readFile, writeFile } from 'node:fs/promises';
const luminosity = rgb => rgb.map(v => v / 255).map(v => v <= .04045 ? v / 12.92 : ((v + .055) / 1.055) ** 2.4).reduce((sum, v, i) => sum + v * [.2126, .7152, .0722][i], 0);
for (const path of ['src/app/globals.css', 'src/app/refinements.css']) {
  const css = postcss.parse(await readFile(path, 'utf8'));
  let count = 0;
  css.walkDecls('color', declaration => {
    if (!/^#[0-9a-f]{6}$/i.test(declaration.value) || declaration.value.toLowerCase() === '#ffffff') return;
    const rgb = declaration.value.slice(1).match(/../g).map(v => parseInt(v, 16));
    if (1.05 / (luminosity(rgb) + .05) >= 5.8) return;
    const navy = [53, 78, 80];
    let output = rgb;
    for (let amount = .04; amount <= 1; amount += .04) {
      output = rgb.map((v, i) => Math.round(v * (1 - amount) + navy[i] * amount));
      if (1.05 / (luminosity(output) + .05) >= 5.8) break;
    }
    declaration.value = '#' + output.map(v => v.toString(16).padStart(2, '0')).join('');
    count++;
  });
  await writeFile(path, css.toString());
  console.log(`${path}: refined ${count} color declarations.`);
}
