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
        name: "记录统计",
        path: '/statistics',
        component: () => import('@/pages/statistics/index.vue')
    }, {
        name: "设置",
        path: '/setting',
        component: () => import('@/pages/setting/index.vue')
    }]
});

export default router;
