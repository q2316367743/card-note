import {createApp} from 'vue'
import {createPinia} from 'pinia';
import App from './App.vue'
import router from './plugin/router';

import ArcoVue from '@arco-design/web-vue';
import ArcoVueIcon from '@arco-design/web-vue/es/icon';

import {setupCalendar} from 'v-calendar';

import {loadScript} from "@/utils/lang/DomUtil";
import {utools} from "@/plugin/utools";

import '@arco-design/web-vue/dist/arco.css';
import "@/assets/less/index.less";
import {config} from "md-editor-v3";
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

// utools挂载
window.isUtools = !!window.utools;
window.utools = window.utools || utools;

if (window.utools.isDev()) {
    console.log("开发环境，不加载统计")
    // @ts-ignore
    window.LA = {
        track(event: string) {
            console.log('测试事件', event);
        }
    }
} else {
    // 非开发环境，加载51统计
    // utools，本地引用
    loadScript("./51/js-sdk-pro.min.js", {id: 'LA_COLLECT'}, () => {
        LA.init({id: "3HYNN6TT7aizMbSW", ck: "3HYNN6TT7aizMbSW", autoTrack: true, hashMode: true});
        // @ts-ignore
        window.LA = LA;
    });
}

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
