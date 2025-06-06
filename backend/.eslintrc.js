module.exports = {
  root: true,
  env: {
    es6: true,
    node: true,
  },
  extends: [
    "eslint:recommended",
    "@typescript-eslint/recommended",
  ],
  parser: "@typescript-eslint/parser",
  parserOptions: {
    project: ["tsconfig.json", "tsconfig.dev.json"],
    sourceType: "module",
    tsconfigRootDir: __dirname,
  },
  ignorePatterns: [
    "/lib/**/*", // Ignore built files.
    "/node_modules/**/*",
  ],
  plugins: [
    "@typescript-eslint",
    "import",
  ],
  rules: {
    // ===== 🚫 قواعد صارمة لمنع any =====
    "@typescript-eslint/no-explicit-any": "error",          // ❌ منع any صراحة
    "@typescript-eslint/no-unsafe-any": "error",            // ❌ منع استخدام any غير آمن
    "@typescript-eslint/no-unsafe-assignment": "error",     // ❌ منع إسناد any
    "@typescript-eslint/no-unsafe-call": "error",           // ❌ منع استدعاء any
    "@typescript-eslint/no-unsafe-member-access": "error",  // ❌ منع الوصول لأعضاء any
    "@typescript-eslint/no-unsafe-return": "error",         // ❌ منع إرجاع any
    "@typescript-eslint/no-unsafe-argument": "error",       // ❌ منع تمرير any كمعامل
    
    // ===== 🔒 قواعد Type Safety =====
    "@typescript-eslint/explicit-function-return-type": "error",
    "@typescript-eslint/explicit-module-boundary-types": "error",
    "@typescript-eslint/strict-boolean-expressions": "error",
    "@typescript-eslint/prefer-nullish-coalescing": "error",
    "@typescript-eslint/prefer-optional-chain": "error",
    "@typescript-eslint/no-non-null-assertion": "error",
    "@typescript-eslint/ban-types": [
      "error",
      {
        "types": {
          "any": "❌ استخدام any ممنوع! استخدم unknown أو نوع محدد",
          "{}": "❌ استخدام {} ممنوع! استخدم Record<string, unknown>",
          "object": "❌ استخدام object ممنوع! حدد النوع بوضوح",
          "Function": "❌ استخدام Function ممنوع! حدد signature الدالة"
        }
      }
    ],
    
    // ===== 📋 قواعد عامة =====
    "quotes": ["error", "double"],
    "import/no-unresolved": 0,
    "indent": ["error", 2],
    "max-len": ["error", {"code": 100}],
    "@typescript-eslint/no-unused-vars": "error",
    "@typescript-eslint/prefer-const": "error",
    "@typescript-eslint/no-var-requires": "error",
    "@typescript-eslint/prefer-as-const": "error",
  },
}; 