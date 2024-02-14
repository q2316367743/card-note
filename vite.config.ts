// vite.config.js
import vue from "@vitejs/plugin-vue";
import vueJsx from '@vitejs/plugin-vue-jsx'
import {defineConfig} from "vite";
import path from "path";

function _resolve(dir: string) {
    return path.resolve(__dirname, dir);
}

export default defineConfig({
    resolve: {
        alias: {
            "@": _resolve("src")
        },
    },
    plugins: [
        vue(), vueJsx()
    ],
    base: "./",
    build: {
        outDir: "src-utools/dist"
    },
    optimizeDeps: {
        include: [
            `monaco-editor/esm/vs/editor/editor.worker`
        ],
    }
});
