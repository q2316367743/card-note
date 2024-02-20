<template>
    <a-layout class="main">
        <link type="text/css" rel="stylesheet" :href="href"/>
        <a-layout-sider collapsed style="z-index: 50">
            <a-menu style="width: 200px;height: 100%;" breakpoint="xl" v-model:selected-keys="selectedKeys">
                <a-menu-item key="/home">
                    <template #icon>
                        <icon-home/>
                    </template>
                    主页
                </a-menu-item>
                <a-menu-item key="/calendar">
                    <template #icon>
                        <icon-calendar/>
                    </template>
                    每日回顾
                </a-menu-item>
                <a-menu-item key="/explore">
                    <template #icon>
                        <icon-bulb/>
                    </template>
                    探索
                </a-menu-item>
                <a-menu-item key="/setting">
                    <template #icon>
                        <icon-settings/>
                    </template>
                    设置
                </a-menu-item>
            </a-menu>
        </a-layout-sider>
        <a-layout-content class="container">
            <router-view/>
        </a-layout-content>
    </a-layout>
</template>
<script lang="ts" setup>
import {computed, ref, watch} from "vue";
import {useRoute, useRouter} from "vue-router";
import {useWindowSize} from "@vueuse/core";
import {useAppStore} from "@/store/AppStore";
import {useSearchNoteEvent} from "@/store/NoteStore";
import MessageUtil from "@/utils/MessageUtil";

const size = useWindowSize();

const route = useRoute();
const router = useRouter();
const selectedKeys = ref(['/home']);

const href = computed(() => `./highlight.js/${useAppStore().dark ? 'github-dark' : 'github'}.css`);

watch(() => selectedKeys.value, value => {
    router.push(value[0]);
});
watch(() => useAppStore().dark, handleTheme, {immediate: true});
watch(() => route.path, value => {
    if (selectedKeys.value[0] !== value) {
        selectedKeys.value[0] = value
    }
});

useAppStore().init()

import("@/store/TagStore").then(res => res.useTagStore().init());
import("@/store/SyncStore").then(res => res.useSyncStore().init());
import("@/store/AiStore").then(res => res.useAiStore().init());


utools.onPluginEnter(action => {
    handleTheme();
    if (action.code === 'append') {
        import("@/store/NoteStore").then(res => res.useNoteStore().init().then(() => res.useNoteStore().add(action.payload, [])));
    }
});

function handleTheme() {
    if (useAppStore().isDarkColors()) {
        document.body.setAttribute('arco-theme', 'dark');
    } else {
        document.body.removeAttribute('arco-theme');
    }

}

window.onTagSearch = useSearchNoteEvent.emit;


let deferredPrompt: any;

// 检查浏览器是否支持PWA
if ('serviceWorker' in navigator && window.matchMedia('(display-mode: standalone)').matches) {
    // 检查是否已安装PWA
    if (!window.matchMedia('(display-mode: standalone)').matches) {
        // 显示安装提示
        const installButton = document.createElement('button');
        installButton.textContent = '安装应用';
        installButton.addEventListener('click', () => {
            // 弹出PWA安装提示
            deferredPrompt.prompt();
            deferredPrompt.userChoice.then((choiceResult: any) => {
                if (choiceResult.outcome === 'accepted') {
                    MessageUtil.success("应用已成功安装");
                } else {
                    MessageUtil.warning("已取消安装")
                }
                deferredPrompt = null;
            });
        });

        // 显示安装按钮
        document.body.appendChild(installButton);
    }
}

// 保存PWA安装提示
window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredPrompt = e;
});

</script>
<style scoped>
</style>
