module.exports = function (api) {
  api.cache(true);
  return {
    presets: ["babel-preset-expo"],
    plugins: [
      ["expo-router/babel"],
      ["react-native-reanimated/plugin"],
      [
        "module-resolver",
        {
          alias: {
            "@api": "./src/api",
            "@app": "./app",
            "@assets": "./assets",
            "@components": "./src/components",
            "@constants": "./src/constants",
            "@functions": "./src/functions",
            "@services": "./src/services",
            "@styles": "./src/styles",
          },
        },
      ],
    ],
  };
};
