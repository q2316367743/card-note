import {createRouter, createWebHashHistory} from 'vue-router';
// 引入路由

const router = createRouter({
    history: createWebHashHistory(),
    routes: [{
        name: "首页",
        path: '/',
        redirect: '/home',
    }, {
        name: "主页",
        path: '/home',
        component: () => import('@/pages/home/index.vue')
    }, {
        name: "每日回顾",
        path: '/calendar',
        component: () => import('@/pages/calendar/index.vue')
    }, {
        name: "搜索",
        path: '/search',
        component: () => import('@/pages/search/index.vue')
    }]
});

export default router;
