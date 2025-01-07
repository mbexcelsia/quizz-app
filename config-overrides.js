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

          // Lire le contenu source
          const sourceContent = fs.readFileSync(swSource, "utf-8");

          // Compiler
          const result = ts.transpileModule(sourceContent, {
            compilerOptions: {
              target: ts.ScriptTarget.ES5,
              module: ts.ModuleKind.CommonJS,
              lib: ["webworker", "es2015"],
              removeComments: true,
            },
          });

          // Écrire le résultat
          fs.writeFileSync(swDest, result.outputText);
        });
      },
    });
  }
  return config;
};
