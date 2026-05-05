const { getDefaultConfig } = require("expo/metro-config");
const path = require("path");
const fs = require("fs");

/** @type {import('expo/metro-config').MetroConfig} */
const config = getDefaultConfig(__dirname);

/**
 * Expo Web otherwise resolves Zustand's ESM files (*.mjs), which use
 * `import.meta` — that breaks in the web runtime ("Cannot use import.meta outside a module").
 * The published CJS *.js files do not use import.meta; prefer them on web.
 */
config.resolver.resolveRequest = (context, moduleName, platform) => {
  if (
    platform === "web" &&
    (moduleName === "zustand" || moduleName.startsWith("zustand/"))
  ) {
    const fileName =
      moduleName === "zustand" ? "index.js" : `${moduleName.replace(/^zustand\//, "")}.js`;
    const filePath = path.join(__dirname, "node_modules", "zustand", fileName);
    if (fs.existsSync(filePath)) {
      return { type: "sourceFile", filePath };
    }
  }
  return context.resolveRequest(context, moduleName, platform);
};

module.exports = config;
