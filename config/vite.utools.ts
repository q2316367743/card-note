// vite.config.js
// @ts-ignore
import vue from "@vitejs/plugin-vue";
// @ts-ignore
import vueJsx from '@vitejs/plugin-vue-jsx'
// @ts-ignore
import {defineConfig} from "vite";
// @ts-ignore
import path from "path";

function _resolve(dir: string) {
    // @ts-ignore
    return path.resolve(__dirname, '../', dir);
}

export default defineConfig({
    resolve: {
        alias: {
            "@": _resolve("src")
        },
    },
    plugins: [
        vue(), vueJsx(),
    ],
    base: "./",
    build: {
        outDir: "src-utools/dist"
    },
    envDir: 'env'
});
