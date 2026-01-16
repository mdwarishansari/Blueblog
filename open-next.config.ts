// open-next.config.ts
// Minimal OpenNext config — no imports, no defineConfig
export default {
  // tell OpenNext we want edge runtime builds
  edgeRuntime: true,

  // standalone output is usually the safest for Cloudflare Pages
  output: "standalone",

  // make sure the builder has something meaningful — this is minimal but valid
  // you can extend this later to control other OpenNext behaviour
}
