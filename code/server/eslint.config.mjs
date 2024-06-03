import eslint from "@eslint/js";
import tseslint from "typescript-eslint";
import eslintConfigPrettier from "eslint-config-prettier";

export default tseslint.config(
    eslint.configs.recommended,
    ...tseslint.configs.recommended,
    {
        // TODO: temporarily disabled most rules, need to fix these later
        rules: {
            "@typescript-eslint/no-explicit-any": "off",
            "@typescript-eslint/no-unused-vars": [
                "error",
                { argsIgnorePattern: "^_" },
            ],
        },
    },
    eslintConfigPrettier,
);
