<template>
    <a-layout class="main">
        <link type="text/css" rel="stylesheet" :href="href"/>
        <a-layout-sider collapsed style="z-index: 50" v-if="!isMobile">
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
        <a-layout-content :class="isMobile ? 'container mobile' : 'container'">
            <router-view/>
        </a-layout-content>
        <a-layout-footer v-if="isMobile" class="footer">
            <a-tabs v-model:active-key="selectedKeys[0]" hide-content position="bottom" style="width: 268px;">
                <a-tab-pane title="主页" key="/home"/>
                <a-tab-pane title="每日回顾" key="/calendar"/>
                <a-tab-pane title="探索" key="/explore"/>
                <a-tab-pane title="设置" key="/setting"/>
            </a-tabs>
        </a-layout-footer>
    </a-layout>
</template>
<script lang="ts" setup>
import {computed, ref, watch} from "vue";
import {useRoute, useRouter} from "vue-router";
import {useAppStore} from "@/store/AppStore";
import {useSearchNoteEvent} from "@/store/NoteStore";


const route = useRoute();
const router = useRouter();
const selectedKeys = ref(['/home']);

const href = computed(() => `./highlight.js/${useAppStore().dark ? 'github-dark' : 'github'}.css`);
// 是否是手机客户端
const isMobile = computed(() => useAppStore().isMobile);

watch(() => selectedKeys.value, value => router.push(value[0]), {deep: true});
watch(() => useAppStore().dark, handleTheme, {immediate: true});
watch(() => route.path, value => {
    if (selectedKeys.value[0] !== value) {
        selectedKeys.value[0] = value
    }
});

useAppStore().init();

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

</script>
<style scoped>
</style>
