const path = require("path");
const fs = require("fs");

module.exports = function override(config, env) {
  // Désactiver complètement la génération de service worker
  config.plugins = config.plugins.filter((plugin) => {
    return (
      !plugin.constructor ||
      (plugin.constructor.name !== "GenerateSW" &&
        plugin.constructor.name !== "InjectManifest")
    );
  });

  // Ne pas générer de source maps en production
  if (env === "production") {
    config.devtool = false;
  }

  // Ajouter un plugin pour copier notre service worker
  if (env === "production") {
    config.plugins.push({
      apply: (compiler) => {
        compiler.hooks.afterEmit.tap("CopyServiceWorker", () => {
          const swSource = path.join(__dirname, "src", "custom-sw.ts");
          const swDest = path.join(__dirname, "build", "custom-sw.js");
          if (fs.existsSync(swSource)) {
            fs.copyFileSync(swSource, swDest);
          }
        });
      },
    });
  }

  return config;
};
