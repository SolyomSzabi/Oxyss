const path = require("path");

const isProduction = process.env.NODE_ENV === "production";
const disableHotReload = process.env.DISABLE_HOT_RELOAD === "true";

/** Content-Security-Policy for the production build: only our own scripts may run. */
const contentSecurityPolicy = () => {
  const apiOrigin = process.env.REACT_APP_BACKEND_URL
    ? new URL(process.env.REACT_APP_BACKEND_URL).origin
    : "";
  return [
    "default-src 'self'",
    "script-src 'self'",
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
    "font-src 'self' data: https://fonts.gstatic.com",
    "img-src 'self' data: blob: https:",
    `connect-src 'self' ${apiOrigin}`.trim(),
    "frame-src https://www.google.com",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "upgrade-insecure-requests",
  ].join("; ");
};

const hardenProductionBuild = (webpackConfig) => {
  // Do not publish source maps of the application code.
  webpackConfig.devtool = false;

  // Keep the webpack runtime in a separate file instead of an inline <script>, so the CSP needs no 'unsafe-inline'.
  webpackConfig.plugins = webpackConfig.plugins.filter(
    (plugin) => plugin.constructor.name !== "InlineChunkHtmlPlugin",
  );

  const htmlPlugin = webpackConfig.plugins.find((plugin) => plugin.constructor.name === "HtmlWebpackPlugin");
  htmlPlugin.options.meta = {
    ...htmlPlugin.options.meta,
    "Content-Security-Policy": { "http-equiv": "Content-Security-Policy", content: contentSecurityPolicy() },
  };
};

module.exports = {
  webpack: {
    alias: {
      "@": path.resolve(__dirname, "src"),
    },
    configure: (webpackConfig) => {
      if (isProduction) {
        hardenProductionBuild(webpackConfig);
      }

      if (disableHotReload) {
        webpackConfig.plugins = webpackConfig.plugins.filter(
          (plugin) => plugin.constructor.name !== "HotModuleReplacementPlugin",
        );
        webpackConfig.watch = false;
        webpackConfig.watchOptions = { ignored: /.*/ };
      } else {
        webpackConfig.watchOptions = {
          ...webpackConfig.watchOptions,
          ignored: ["**/node_modules/**", "**/.git/**", "**/build/**", "**/coverage/**", "**/public/**"],
        };
      }

      return webpackConfig;
    },
  },
};
