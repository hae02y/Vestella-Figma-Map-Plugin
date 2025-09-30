// https://www.figma.com/plugin-docs/manifest/

export default {
  name: "Vestella Query Generator", // Insert your plugin name
  id: "1554327723717637444",
  api: "1.0.0",
  main: "./canvas.js",
  ui: "./plugin.html",
  documentAccess: "dynamic-page",
  editorType: ["figma"],
  networkAccess: {
    allowedDomains: ["none"],
  },
};
