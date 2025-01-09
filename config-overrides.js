const path = require("path");
const ts = require("typescript");
const fs = require("fs");

module.exports = function override(config, env) {
  config.plugins = config.plugins.filter(
    (plugin) =>
      !plugin.constructor ||
      !["GenerateSW", "InjectManifest"].includes(plugin.constructor.name)
  );

  if (env === "production") {
    config.devtool = false;
    config.plugins.push({
      apply: (compiler) => {
        compiler.hooks.afterEmit.tap("CompileServiceWorker", () => {
          const swSource = path.join(__dirname, "src", "custom-sw.ts");
          const swDest = path.join(__dirname, "build", "custom-sw.js");

          const sourceContent = fs.readFileSync(swSource, "utf-8");
          const compiled = ts.transpileModule(sourceContent, {
            compilerOptions: {
              target: ts.ScriptTarget.ES5,
              module: ts.ModuleKind.None,
              lib: ["webworker", "es2015"],
              removeComments: true,
              isolatedModules: true,
              skipLibCheck: true,
              noImplicitAny: false,
            },
          });

          // Nettoyage du code TypeScript généré
          let cleanOutput = compiled.outputText
            .replace(
              '"use strict";\nObject.defineProperty(exports, "__esModule", { value: true });\n',
              ""
            )
            .replace(/exports\./g, "")
            .replace(/var _this = this;/g, "");

          fs.writeFileSync(swDest, cleanOutput);
        });
      },
    });
  }
  return config;
};
