import js from "@eslint/js";
import tsParser from "@typescript-eslint/parser";
import tsPlugin from "@typescript-eslint/eslint-plugin";
import reactHooksPlugin from "eslint-plugin-react-hooks";
import reactRefreshPlugin from "eslint-plugin-react-refresh";

export default [
  // Global ignores
  {
    ignores: [
      "dist/**",
      "node_modules/**",
      "playwright-report/**",
      "test-results/**",
      "scripts/backups/**",
      "*.cjs",
      "src/__tests__/**",
      "src/app/components/ui/**", // shadcn/ui generated files — not our code to lint
    ],
  },

  // Base JS recommended (no-undef etc.) — only for plain JS files not covered by TS config
  {
    ...js.configs.recommended,
    files: ["**/*.js"],
  },

  // TypeScript + React source files
  {
    files: ["src/**/*.{ts,tsx}"],
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        project: "./tsconfig.json",
        tsconfigRootDir: import.meta.dirname,
        ecmaVersion: 2020,
        sourceType: "module",
        ecmaFeatures: { jsx: true },
      },
      globals: {
        window: "readonly",
        document: "readonly",
        console: "readonly",
        localStorage: "readonly",
        sessionStorage: "readonly",
        setTimeout: "readonly",
        clearTimeout: "readonly",
        setInterval: "readonly",
        clearInterval: "readonly",
        fetch: "readonly",
        URL: "readonly",
        URLSearchParams: "readonly",
        process: "readonly",
        React: "readonly",
      },
    },
    plugins: {
      "@typescript-eslint": tsPlugin,
      "react-hooks": reactHooksPlugin,
      "react-refresh": reactRefreshPlugin,
    },
    rules: {
      // TypeScript recommended
      ...tsPlugin.configs["recommended"].rules,

      // React Hooks
      ...reactHooksPlugin.configs.recommended.rules,

      // React Refresh (Vite HMR) — warn only, context files legitimately export non-components
      "react-refresh/only-export-components": [
        "warn",
        { allowConstantExport: true },
      ],

      // Disable overly strict rules for this codebase
      "@typescript-eslint/no-explicit-any": "warn",
      "@typescript-eslint/no-unused-vars": [
        "error",
        { argsIgnorePattern: "^_", varsIgnorePattern: "^_", caughtErrorsIgnorePattern: "^_" },
      ],
      "@typescript-eslint/no-non-null-assertion": "warn",
      // setState in useEffect is a standard controlled-form pattern
      "react-hooks/set-state-in-effect": "off",
      // React Compiler rules — not applicable (project doesn't use React Compiler)
      "react-hooks/preserve-manual-memoization": "off",
      "react-hooks/purity": "off",
      "no-console": ["warn", { allow: ["warn", "error"] }],
      "no-unused-vars": "off", // handled by @typescript-eslint/no-unused-vars
      "no-undef": "off", // TypeScript handles this better
    },
  },

  // Playwright E2E tests
  {
    files: ["e2e/**/*.ts"],
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        project: "./tsconfig.json",
        tsconfigRootDir: import.meta.dirname,
        ecmaVersion: 2020,
        sourceType: "module",
      },
      globals: {
        console: "readonly",
        process: "readonly",
      },
    },
    plugins: {
      "@typescript-eslint": tsPlugin,
    },
    rules: {
      ...tsPlugin.configs["recommended"].rules,
      "@typescript-eslint/no-unused-vars": [
        "error",
        { argsIgnorePattern: "^_", varsIgnorePattern: "^_" },
      ],
      "@typescript-eslint/no-explicit-any": "warn",
      "@typescript-eslint/no-non-null-assertion": "warn",
      "no-undef": "off",
      "no-unused-vars": "off",
    },
  },

  // Vite config
  {
    files: ["vite.config.ts"],
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        project: "./tsconfig.json",
        tsconfigRootDir: import.meta.dirname,
        ecmaVersion: 2020,
        sourceType: "module",
      },
      globals: {
        process: "readonly",
        __dirname: "readonly",
      },
    },
    plugins: {
      "@typescript-eslint": tsPlugin,
    },
    rules: {
      ...tsPlugin.configs["recommended"].rules,
      "no-undef": "off",
      "no-unused-vars": "off",
      "@typescript-eslint/no-unused-vars": ["error", { argsIgnorePattern: "^_" }],
    },
  },
];
