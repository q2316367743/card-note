import {createApp} from 'vue'
import {createPinia} from 'pinia';
import App from './App.vue'

import ArcoVue from '@arco-design/web-vue';
import ArcoVueIcon from '@arco-design/web-vue/es/icon';

import {setupCalendar} from 'v-calendar';
import {config} from "md-editor-v3";

import '@arco-design/web-vue/dist/arco.css';
import "@/assets/less/index.less";

import router from '@/plugin/router';
import {highlightPlugin, linkPlugin, tagPlugin} from "@/plugin/markdown";
import {
    getCropperCss,
    getCropperJs,
    getHighlightJs,
    getKatexCss,
    getKatexJs,
    getMermaidSrc, getPrettierParseMarkdown, getPrettierStandalone,
    getScreenFullJs
} from "@/plugin/library";
import {utools} from "@/plugin/utools";

// utools挂载
window.isUtools = !!window.utools;
window.utools = window.utools || utools;

config({
    iconfontType: 'svg',
    markdownItConfig(md) {
        md.use(highlightPlugin).use(tagPlugin).use(linkPlugin);
    },
    editorExtensions: {
        highlight: {
            css: {
                'github': {
                    dark: './highlight.js/github-dark.css',
                    light: './highlight.js/github.css'
                }
            },
            js: getHighlightJs()
        },
        mermaid: {
            js: getMermaidSrc()
        },
        katex: {
            css: getKatexCss(),
            js: getKatexJs()
        },
        cropper: {
            css: getCropperCss(),
            js: getCropperJs()
        },
        screenfull: {
            js: getScreenFullJs()
        },
        iconfont: './font_2605852_cmafimm6hot.js',
        prettier: {
            parserMarkdownJs: getPrettierParseMarkdown(),
            standaloneJs: getPrettierStandalone()
        }
    }
})

// 额外引入图标库
createApp(App)
    .use(ArcoVue)
    .use(ArcoVueIcon)
    .use(createPinia())
    .use(router)
    .use(setupCalendar, {})
    .mount('#app');
