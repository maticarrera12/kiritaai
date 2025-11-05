import js from "@eslint/js";
import ts from "@typescript-eslint/eslint-plugin";
import tsParser from "@typescript-eslint/parser";
import next from "@next/eslint-plugin-next";
import prettier from "eslint-plugin-prettier";
import importPlugin from "eslint-plugin-import";
import unusedImports from "eslint-plugin-unused-imports";

export default [
  js.configs.recommended,
  {
    files: ["**/*.{ts,tsx,js,jsx}"],
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        ecmaVersion: 2022,
        sourceType: "module",
      },
  
      globals: {
        window: true,
        document: true,
        console: true,
        fetch: true,
        alert: true,
        navigator: true,
        setTimeout: true,
        clearTimeout: true,
        setInterval: true,
        clearInterval: true,
        File: true,
        NodeJS: true,
        HTMLDivElement: true,
        HTMLInputElement: true,
        HTMLAnchorElement: true,
        HTMLButtonElement: true,
        Event: true,
        KeyboardEvent: true,
        Request: true,
        URL: true,
        Buffer: true,
        process: true,
        React: true,
      },
    },
    plugins: {
      "@typescript-eslint": ts,
      prettier,
      import: importPlugin,
      "unused-imports": unusedImports,
      next,
    },
    rules: {
      // 💅 Prettier
      "prettier/prettier": "error",


      "unused-imports/no-unused-imports": "error",
      "import/order": [
        "warn",
        {
          alphabetize: { order: "asc", caseInsensitive: true },
          groups: [["builtin", "external", "internal"]],
          "newlines-between": "always",
        },
      ],

      "@typescript-eslint/no-unused-vars": [
        "warn",
        { argsIgnorePattern: "^_", varsIgnorePattern: "^_" },
      ],
      "react/no-unescaped-entities": "off",
      "no-console": "warn",
    },
  },
  {
    ignores: [
      "node_modules/**",
      ".next/**",
      "out/**",
      "dist/**",
      "build/**",
      "next-env.d.ts",
    ],
  },
];
