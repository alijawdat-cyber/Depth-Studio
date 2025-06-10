import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";
import tsPlugin from '@typescript-eslint/eslint-plugin';
import tsParser from '@typescript-eslint/parser';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  // إعدادات Next.js الأساسية
  ...compat.extends("next/core-web-vitals"),
  
  // إعدادات TypeScript والجودة
  {
    files: ['**/*.{ts,tsx,js,jsx}'],
    ignores: ['.next/**', 'out/**', 'dist/**', 'build/**', 'node_modules/**'],
    languageOptions: { 
      parser: tsParser,
      parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module',
        ecmaFeatures: {
          jsx: true
        }
      }
    },
    plugins: {
      '@typescript-eslint': tsPlugin,
    },
    rules: {
      // 🔥 قواعد صارمة ضد الاستيرادات غير المستخدمة
      "prefer-const": "error",
      "no-var": "error",
      "no-unused-vars": ["error", { 
        args: "after-used", 
        ignoreRestSiblings: false,
        caughtErrors: "all"
      }],
      
      // 🛡️ منع الحذف "السريع" للأنواع - صارم!
      "@typescript-eslint/no-explicit-any": "error",
      "@typescript-eslint/no-unused-vars": ["error", {
        args: "after-used",
        ignoreRestSiblings: false,
        caughtErrors: "all"
      }],
      
      // تخفيف قواعد React للتطوير السريع (باقية كما هي)
      "react/no-unescaped-entities": "warn",
      "@next/next/no-img-element": "warn", 
      "react-hooks/exhaustive-deps": "warn"
    },
  },
];

export default eslintConfig;
