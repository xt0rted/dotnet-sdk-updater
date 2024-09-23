declare module "eslint-plugin-jest" {
  import type {
    ESLint,
    Linter,
  } from "eslint";

  const eslintPluginJest: ESLint.Plugin & {
    configs: {
      all: Linter.Config;
      recommended: Linter.Config;
      styles: Linter.Config;
      "flat/all": Linter.Config;
      "flat/recommended": Linter.Config;
      "flat/styles": Linter.Config
    };
  };

  export = eslintPluginJest;
}
