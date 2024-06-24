<template>
    <a-layout :class="{main: true, detach: detach,'utools': isUtools, 'bg-color': true,}">
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
import {useRefreshNoteEvent, useSearchNoteEvent} from "@/store/NoteStore";
import MessageUtil from "@/utils/modal/MessageUtil";
import {isUtools} from "@/plugin/utools";
import AppHeader from "@/components/App/AppHeader.vue";
import {checkLibrary} from "@/plugin/library";


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
import("@/store/RoleStore").then(res => res.useRoleStore().init());
// 资源检查
checkLibrary()

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

window.onTagSearch = e => useSearchNoteEvent.emit(decodeURIComponent(e));
window.openMessage = (content, level) => {
    MessageUtil[level || 'warning'](content);
}
window.copyText = (content: string) => {
    utools.copyText(decodeURIComponent(content));
}
window.shellOpenExternal = (url: string) => {
    utools.shellOpenExternal(decodeURIComponent(url));
}

window.addEventListener('click', e => {
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
