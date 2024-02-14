<template>
    <div ref="notePreviewRef"/>
</template>
<script lang="ts" setup>
import {nextTick, onMounted, ref} from "vue";
import {getCursorPosition} from "@/utils/DomUtil";
import {TextareaInstance} from "@arco-design/web-vue";
import {useNoteStore} from "@/store/NoteStore";
import MessageUtil from "@/utils/MessageUtil";
import Cherry from "cherry-markdown";

const props = defineProps({
    content: String
});

const notePreviewRef = ref<HTMLDivElement>()

onMounted(() => {
    new Cherry({
        el: notePreviewRef.value,
        editor: {
            theme: utools.isDarkColors() ? 'material-ocean' : 'default',
            defaultModel: 'previewOnly',
        },
        toolbars: {
            theme: utools.isDarkColors() ? 'dark' : 'light',
            showToolbar: false
        },
        previewer: {
            className: 'note-preview'
        },
        value: props.content
    });
});


</script>
<style>
.note-preview {
    color: var(--color-text-1);
    background-color: var(--color-bg-2);
}
</style>
