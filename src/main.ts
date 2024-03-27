import {createApp} from 'vue'
import {createPinia} from 'pinia';
import App from './App.vue'
import router from './plugin/router';

import ArcoVue from '@arco-design/web-vue';
import ArcoVueIcon from '@arco-design/web-vue/es/icon';
import '@arco-design/web-vue/dist/arco.css';

import {utools, preload} from "@/plugin/utools";
import "@/less/main.less";
import "@/less/post.less";
import "@/less/customer.less";

import "highlight.js/styles/github.css";
import {setupCalendar} from 'v-calendar';

import {loadScript} from "@/utils/DomUtil";

// utools挂载
window.isUtools = !!window.utools;
window.utools = window.utools || utools;
window.preload = window.preload || preload;

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

// 额外引入图标库
createApp(App)
    .use(ArcoVue)
    .use(ArcoVueIcon)
    .use(createPinia())
    .use(router)
    .use(setupCalendar, {})
    .mount('#app');
