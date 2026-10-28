// Build a diagnostic bundle from current source without modifying production files.
import { createRequire } from 'node:module';
import { readFileSync, mkdirSync, copyFileSync } from 'node:fs';
import { resolve, relative } from 'node:path';
const require = createRequire(new URL('../../packages/cli/package.json', import.meta.url));
const { build } = require('esbuild');
const ts = createRequire(new URL('../../package.json', import.meta.url))('typescript');
const root = resolve('.');
const destination = resolve(process.argv[2]);
mkdirSync(resolve(destination, 'profile'), { recursive: true });
copyFileSync('packages/cli/package.json', resolve(destination, 'package.json'));
const plugin = {
  name: 'udi-initialization-profile',
  setup(builder) {
    builder.onResolve({filter:/^@udi\/(core|knowledge)(?:\/.*)?$/}, args => {
      const [, name, entry='index'] = args.path.match(/^@udi\/(core|knowledge)(?:\/(.*))?$/);
      return {path:resolve(root,'packages',name,'src',entry+'.ts')};
    });
    builder.onLoad({ filter: /packages\/(core|knowledge|cli)\/src\/.*\.ts$/ }, args => {
      const path = relative(root, args.path).replaceAll('\\', '/');
      const source = readFileSync(args.path, 'utf8').replace(/^#![^\n]*\n/, '');
      const ast = ts.createSourceFile(args.path, source, ts.ScriptTarget.Latest, true);
      const edits = [];
      const wrap = (body, label) => {
        if (!body || !ts.isBlock(body)) return;
        const key = JSON.stringify(label);
        edits.push([body.getStart(ast)+1, `const __phaseStart = performance.now(); try {`]);
        edits.push([body.end-1, `} finally { const p=globalThis.__udiProfile; if(p) { p.phases[${key}]=(p.phases[${key}]??0)+performance.now()-__phaseStart; p.counts[${key}]=(p.counts[${key}]??0)+1; } }`]);
      };
      let actionIndex = 0;
      const visit = node => {
        if (ts.isFunctionDeclaration(node) && node.name?.text === 'validateCatalog') wrap(node.body, 'catalog-validation');
        if (ts.isConstructorDeclaration(node) && ts.isClassDeclaration(node.parent) && ['Bm25Retriever','KnowledgeIndexV2'].includes(node.parent.name?.text)) wrap(node.body, node.parent.name.text);
        if (path === 'packages/cli/src/index.ts' && ts.isCallExpression(node) && ts.isPropertyAccessExpression(node.expression) && node.expression.name.text === 'action') {
          wrap(node.arguments[0]?.body, 'dispatch:' + ['search','recommend','init','doctor'][actionIndex++]);
        }
        ts.forEachChild(node, visit);
      };
      visit(ast);
      edits.sort((a,b)=>b[0]-a[0]);
      let contents = source;
      for (const [position, insertion] of edits) contents = contents.slice(0,position)+insertion+contents.slice(position);
      if (/\/(schemas|v2-schemas|catalog)\.ts$/.test(path)) {
        const name = '__moduleStart_' + path.replace(/[^a-zA-Z0-9]/g,'_');
        contents = `const ${name}=performance.now();\n` + contents + `\nif(globalThis.__udiProfile)globalThis.__udiProfile.modules[${JSON.stringify(path)}]=performance.now()-${name};\n`;
      }
      if (path === 'packages/cli/src/index.ts') {
        contents = `if(globalThis.__udiProfile)globalThis.__udiProfile.cliRegistrationStartMs=performance.now();\n` + contents;
        contents = contents.replace(/(?=(?:await )?program\.parse(?:Async)?\(\);)/, 'if(globalThis.__udiProfile)globalThis.__udiProfile.dispatchStartMs=performance.now();\n');
      }
      return { contents, loader: 'ts' };
    });
  }
};
await build({
  absWorkingDir: resolve('packages/cli'), bundle: true,
  banner: {js:'import { createRequire as udiCreateRequire } from "node:module"; const require=udiCreateRequire(import.meta.url);'},
  entryPoints:['src/index.ts'], outfile:resolve(destination,'profile/index.js'), platform:'node', format:'esm',target:'node22',plugins:[plugin],metafile:true
});
console.log(resolve(destination,'profile/index.js'));
