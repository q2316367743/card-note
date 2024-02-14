<template>
    <div v-html="preview"></div>
</template>
<script lang="ts" setup>
import {ref, watch} from "vue";
import {marked} from "marked";
import {renderMarkdown} from "@/plugin/markdown";

const props = defineProps({
    content: String
});

const preview = ref("");

watch(() => props.content,
    value => renderMarkdown(value).then(html => preview.value = html),
    {immediate: true});

</script>
<style>
.note-preview {
    color: var(--color-text-1);
    background-color: var(--color-bg-2);
}
</style>
