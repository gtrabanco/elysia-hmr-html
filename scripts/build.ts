import isolatedDecl from 'bun-plugin-isolated-decl';

await Bun.build({
  entrypoints: ['./src/index.ts'],
  outdir: './dist/bun',
  target: "bun",
  format: "esm",
  minify: true,
  external: ["elysia"],
  sourcemap: "external",
  plugins: [isolatedDecl()]
})

await Bun.build({
  entrypoints: ['./src/index.ts'],
  outdir: './dist/node',
  target: "node",
  format: "esm",
  minify: true,
  external: ["elysia"],
  sourcemap: "external",
})

console.log('✅ Build completed')