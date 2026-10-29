import { defineConfig } from 'vite'
import { createHash } from 'node:crypto'
import { readFile, readdir, writeFile } from 'node:fs/promises'
import { join, relative, sep } from 'node:path'

// Derleme kabuğunu ve çevrimdışı atlas verilerini versiyonlu bir pakete dönüştür.
function offlineAtlas() {
  return {
    name: 'offline-atlas',
    apply: 'build',
    async writeBundle(options) {
      const out = options.dir || 'dist';
      async function walk(dir) {
        const entries = await readdir(dir, { withFileTypes: true });
        return (await Promise.all(entries.map(async (e) => e.isDirectory() ? walk(join(dir, e.name)) : [join(dir, e.name)]))).flat();
      }
      const files = (await walk(out)).filter((f) => !f.endsWith(`${sep}sw.js`) && !f.endsWith('.map')).sort();
      const paths = files.map((f) => relative(out, f).split(sep).join('/'));
      const hash = createHash('sha256');
      for (const [i, file] of files.entries()) { hash.update(paths[i]); hash.update(await readFile(file)); }
      const swPath = join(out, 'sw.js');
      const sw = await readFile(swPath, 'utf8');
      hash.update(sw);
      await writeFile(swPath, sw.replace('__VERSION__', hash.digest('hex').slice(0, 16)).replace('__PRECACHE__', JSON.stringify(paths)));
    },
  };
}
export default defineConfig({
  plugins: [offlineAtlas()],
  server: { host: '0.0.0.0', port: 5173, allowedHosts: true },
  preview: { host: '0.0.0.0', port: 5173, allowedHosts: true }
})
