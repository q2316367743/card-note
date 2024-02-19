<template>
    <a-layout class="main">
        <link type="text/css" rel="stylesheet" :href="href"/>
        <a-layout-header class="header" v-if="wap">
            <icon-menu class="menu" @click="visible = true"/>
            <span class="title">卡片笔记</span>
        </a-layout-header>
        <a-layout-sider collapsed style="z-index: 50" v-else>
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
                <a-menu-item key="/search">
                    <template #icon>
                        <icon-search/>
                    </template>
                    搜索
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
        <a-drawer v-model:visible="visible" :header="false" :footer="false" placement="left">
            <a-menu v-model:selected-keys="selectedKeys" :default-collapsed="false">
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
                <a-menu-item key="/search">
                    <template #icon>
                        <icon-search/>
                    </template>
                    搜索
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
        </a-drawer>
    </a-layout>
</template>
<script lang="ts" setup>
import {computed, ref, watch} from "vue";
import {useRoute, useRouter} from "vue-router";
import { useWindowSize } from "@vueuse/core";
import {useAppStore} from "@/store/AppStore";
import {useSearchNoteEvent} from "@/store/NoteStore";

const size = useWindowSize();

const route = useRoute();
const router = useRouter();
const selectedKeys = ref(['/home']);
const visible = ref(false);

const href = computed(() => `./highlight.js/${useAppStore().dark ? 'github-dark' : 'github'}.css`);
const wap = computed(() => size.width.value < 790);

watch(() => selectedKeys.value, value => {
    router.push(value[0]);
    if (visible.value) {
        visible.value = false;
    }
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


utools.onPluginEnter(handleTheme);

function handleTheme() {
    if (useAppStore().isDarkColors()) {
        document.body.setAttribute('arco-theme', 'dark');
    } else {
        document.body.removeAttribute('arco-theme');
    }

}

window.onTagSearch = useSearchNoteEvent.emit

</script>
<style scoped>
</style>
