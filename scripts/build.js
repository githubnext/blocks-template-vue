const esbuild = require("esbuild");
const ignorePlugin = require("esbuild-plugin-ignore");
const vuePlugin = require("esbuild-plugin-vue3");
const path = require("path");

process.env.BABEL_ENV = "production";
process.env.NODE_ENV = "production";

const build = async () => {
  const blocksConfigPath = path.resolve(process.cwd(), "blocks.config.json");
  const blocksConfig = require(blocksConfigPath);

  const blockBuildFuncs = blocksConfig.map((block) => {
    const stdin = {
      resolveDir: process.cwd(),
      contents: `
    "use strict";
    import { createApp, h } from "@vue/runtime-dom";
    import Component from "./${block.entry}";

    let instance;

    export default (props) => {
      if (!instance) {
        const app = createApp({
          data() {
            return {
              ...props,
            };
          },
          render() {
            return h(Component, {
              ...Object.fromEntries(
                Object.keys(props).map((key) => [key, this[key]])
              ),
            });
          },
        });
        instance = app.mount("#root");
      } else {
        for (const key in props) {
          instance.$data[key] = props[key];
        }
      }
    };
    `,
    };

    return esbuild.build({
      stdin,
      bundle: true,
      outdir: `dist/${block.id}`,
      format: "iife",
      plugins: [
        vuePlugin(),
        ignorePlugin([{ resourceRegExp: /@githubnext\/blocks/ }]),
      ],
      globalName: "VanillaBlockBundle",
      minify: true,
    });
  });

  try {
    await Promise.all(blockBuildFuncs);
  } catch (e) {
    console.error("Error bundling blocks", e);
  }
};
build();

module.exports = build;
