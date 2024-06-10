<template>
    <a-layout :class="{main: true, detach: detach,'utools': isUtools, 'bg-color': true,}">
        <link type="text/css" rel="stylesheet" :href="href"/>
        <a-layout-header v-if="!isMobile">
            <div class="card card-container nav" style="height: 40px">
                <div class="header">
                    <a-button type="text">
                        <template #icon>
                            <icon-menu/>
                        </template>
                    </a-button>
                    <div style="line-height: 30px;">
                        <div class="statistics" v-if="isMobile">
                            <span>{{ day }} 天</span>
                            <a-divider direction="vertical"/>
                            <span>{{ noteLength }} 条笔记</span>
                        </div>
                        <div class="statistics" v-if="!isMobile">在过去的 {{ day }} 天中，共记录 {{ noteLength }} 条笔记</div>
                    </div>
                </div>
            </div>
        </a-layout-header>
        <a-layout-content
            :class="{container: true, mobile: isMobile}">
            <router-view/>
        </a-layout-content>
        <a-layout-footer v-if="isMobile" class="footer">
            <a-tabs v-model:active-key="selectedKeys[0]" hide-content position="bottom" style="width: 300px;">
                <a-tab-pane title="主页" key="/home"/>
                <a-tab-pane title="每日回顾" key="/calendar"/>
                <a-tab-pane title="记录统计" key="/statistics"/>
                <a-tab-pane title="设置" key="/setting"/>
            </a-tabs>
        </a-layout-footer>
    </a-layout>
</template>
<script lang="ts" setup>
import {computed, ref, watch} from "vue";
import {useRoute, useRouter} from "vue-router";
import {detach, useAppStore} from "@/store/AppStore";
import {useNoteStore, useRefreshNoteEvent, useSearchNoteEvent} from "@/store/NoteStore";
import MessageUtil from "@/utils/modal/MessageUtil";
import {isUtools} from "@/plugin/utools";


const route = useRoute();
const router = useRouter();
const selectedKeys = ref(['/home']);

const href = computed(() => `./highlight.js/${useAppStore().dark ? 'github-dark' : 'github'}.css`);
// 是否是手机客户端
const isMobile = computed(() => useAppStore().isMobile);
const allIds = computed(() => useNoteStore().allIds())
const noteLength = computed(() => allIds.value.length);
const minDay = computed(() => Math.min(...allIds.value, new Date().getTime()));
const day = computed(() => Math.floor(((new Date().getTime()) - minDay.value) / (24 * 60 * 60 * 1000)));

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
import("@/store/RoleStore").then(res => res.useRoleStore().init());


utools.onPluginEnter(action => {
    handleTheme();
    if (action.code === 'append') {
        import("@/store/NoteStore").then(res =>
            res.useNoteStore().init().then(() =>
                res.useNoteStore().add(action.payload, []).then(() => {
                    useRefreshNoteEvent.emit();
                    utools.hideMainWindow();
                    utools.outPlugin();
                })));
    }
});
utools.onPluginDetach(() => {
    console.log('分离窗口')
    detach.value = true;
})

function handleTheme() {
    if (useAppStore().isDarkColors()) {
        document.body.setAttribute('arco-theme', 'dark');
    } else {
        document.body.removeAttribute('arco-theme');
    }
}

window.onTagSearch = useSearchNoteEvent.emit;
window.openMessage = (content, level) => {
    MessageUtil[level || 'warning'](content);
}

window.copyText = (content: string) => {
    utools.copyText(decodeURIComponent(content));
}

</script>
<style scoped>
</style>
