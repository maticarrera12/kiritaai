import js from "@eslint/js";
import ts from "@typescript-eslint/eslint-plugin";
import tsParser from "@typescript-eslint/parser";
import next from "@next/eslint-plugin-next";
import prettier from "eslint-plugin-prettier";
import importPlugin from "eslint-plugin-import";
import unusedImports from "eslint-plugin-unused-imports";
import reactHooks from "eslint-plugin-react-hooks";
import globals from "globals"; // <--- 1. IMPORTAR ESTO

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
        ...globals.browser,
        ...globals.node,    
        React: true,       
      },
    },
    plugins: {
      "@typescript-eslint": ts,
      prettier,
      import: importPlugin,
      "unused-imports": unusedImports,
      "react-hooks": reactHooks,
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
      "no-undef": "off", 
      
      "no-unused-vars": "off",
      "@typescript-eslint/no-unused-vars": [
        "warn",
        { argsIgnorePattern: "^_", varsIgnorePattern: "^_" },
      ],
      "react/no-unescaped-entities": "off",
      "react-hooks/rules-of-hooks": "error",
      "react-hooks/exhaustive-deps": "warn",
      "no-console": "warn",
    },
  },
  {
    ignores: ["node_modules/**", ".next/**", "out/**", "dist/**", "build/**", "next-env.d.ts"],
  },
];