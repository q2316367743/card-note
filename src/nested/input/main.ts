import {createApp} from 'vue'
import {createPinia} from 'pinia';
import App from './App.vue'

import ArcoVue from '@arco-design/web-vue';
import ArcoVueIcon from '@arco-design/web-vue/es/icon';
import '@arco-design/web-vue/dist/arco.css';

import "@/less/main.less";
import "@/less/post.less";
import "@/less/customer.less";
import "highlight.js/styles/github.css";

// 额外引入图标库
createApp(App)
    .use(ArcoVue)
    .use(ArcoVueIcon)
    .use(createPinia())
    .mount('#app');
