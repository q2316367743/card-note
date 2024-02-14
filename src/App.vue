<template>
    <a-layout class="main">
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
                        <icon-bulb />
                    </template>
                    探索
                </a-menu-item>
            </a-menu>
        </a-layout-sider>
        <a-layout-content class="container">
            <router-view/>
        </a-layout-content>
    </a-layout>
</template>
<script lang="ts" setup>
import {ref, watch} from "vue";
import {useRouter} from "vue-router";
import {useTagStore} from "@/store/TagStore";

const router = useRouter();
const selectedKeys = ref(['/home']);

watch(() => selectedKeys.value, value => router.push(value[0]));

if (utools.isDarkColors()) {
    document.body.setAttribute('arco-theme', 'dark')
}

utools.onPluginEnter(() => {
    if (utools.isDarkColors()) {
        document.body.setAttribute('arco-theme', 'dark')
    }
});

useTagStore().init();


</script>
<style scoped>
</style>
