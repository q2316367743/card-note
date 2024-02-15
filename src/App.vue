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
    </a-layout>
</template>
<script lang="ts" setup>
import {computed, ref, watch} from "vue";
import {useRoute, useRouter} from "vue-router";
import {useTagStore} from "@/store/TagStore";
import {useAppStore} from "@/store/AppStore";
import {useSyncStore} from "@/store/SyncStore";

const route = useRoute();
const router = useRouter();
const selectedKeys = ref(['/home']);

const href = computed(() => `/highlight.js/${useAppStore().dark ? 'github-dark' : 'github'}.css`);

watch(() => selectedKeys.value, value => router.push(value[0]));
watch(() => useAppStore().dark, handleTheme, {immediate: true});
watch(() => route.path, value => {
    if (selectedKeys.value[0] !== value) {
        selectedKeys.value[0] = value
    }
})

useTagStore().init();
useSyncStore().init();
useAppStore().init();


utools.onPluginEnter(handleTheme);

function handleTheme() {
    if (useAppStore().isDarkColors()) {
        document.body.setAttribute('arco-theme', 'dark');
    } else {
        document.body.removeAttribute('arco-theme');
    }

}

</script>
<style scoped>
</style>
