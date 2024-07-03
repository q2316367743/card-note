<template>
    <a-layout :class="layoutClass">
        <link type="text/css" rel="stylesheet" :href="href"/>
        <app-header/>
        <a-layout-content
            :class="{container: true, mobile: isMobile}">
            <router-view/>
        </a-layout-content>
    </a-layout>
</template>
<script lang="ts" setup>
import {computed, ref, watch} from "vue";
import {useRoute, useRouter} from "vue-router";
import {detach, useAppStore} from "@/store/AppStore";
import {useNoteStore, useRefreshNoteEvent, useSearchNoteEvent} from "@/store/NoteStore";
import MessageUtil from "@/utils/modal/MessageUtil";
import {isUtools} from "@/plugin/utools";
import AppHeader from "@/components/App/AppHeader.vue";
import {checkLibrary} from "@/plugin/library";
import {prettyDate} from "@/utils/lang/FormatUtil";


const route = useRoute();
const router = useRouter();
const selectedKeys = ref(['/home']);

const href = computed(() => `./highlight.js/${useAppStore().dark ? 'github-dark' : 'github'}.css`);
// 是否是手机客户端
const isMobile = computed(() => useAppStore().isMobile);
const layoutClass = computed(() => ({main: true, detach: detach.value, 'utools': isUtools, 'bg-color': true}))

watch(selectedKeys, value => router.push(value[0]), {deep: true});
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
// 资源检查
checkLibrary()

utools.onPluginDetach(() => detach.value = true);
utools.onPluginEnter(action => {
    if (action.code === 'append') {
        import("@/store/NoteStore").then(res =>
            res.useNoteStore().init().then(() =>
                res.useNoteStore().add(action.payload, []).then(() => {
                    useRefreshNoteEvent.emit();
                    utools.hideMainWindow();
                    utools.outPlugin();
                })));
    }
    detach.value = window.utools ? window.utools.getWindowType() !== 'main' : detach.value;
});

utools.onMainPush(action => {
    if (action.code !== 'search') {
        return [];
    }
    let items = useNoteStore().searchSync([action.payload]);
    if (items.length > 6) {
        return [...items.slice(0, 5).map(e => ({
            text: e.record.content,
            title: e.record.content,
            tag: prettyDate(e.record.updateTime)
        })), {
            text: `共搜索到 ${items.length + 1} 条记录，查看更多...`
        }]
    }
    return items.map(e => ({
        text: e.record.content,
        title: e.record.content,
        tag: prettyDate(e.record.updateTime)
    }))
}, action => {
    // 此处进行处理
    router.push({
        path: '/home',
        query: {
            keyword: action.payload
        }
    });
    return true;
})

window.onTagSearch = e => useSearchNoteEvent.emit(decodeURIComponent(e));
window.openMessage = (content, level) => MessageUtil[level || 'warning'](content);
window.copyText = (content: string) => utools.copyText(decodeURIComponent(content));
window.shellOpenExternal = (url: string) => utools.shellOpenExternal(decodeURIComponent(url));
window.addEventListener('click', e => {
    if (!isUtools) {
        return;
    }
    const ele = e.target as HTMLElement;
    if (ele && ele.tagName && ele.tagName.toUpperCase() === 'A') {
        // a标签
        const href = ele.getAttribute('href');
        if (href) {
            utools.shellOpenExternal(href);
        }
    }
});

</script>
<style scoped>
</style>
