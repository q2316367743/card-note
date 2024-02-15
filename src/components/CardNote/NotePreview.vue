<template>
    <a-typography-paragraph :ellipsis="{ rows: 3, expandable: true}">
        <div v-html="preview" class="juejin"></div>
    </a-typography-paragraph>
</template>
<script lang="ts" setup>
import {PropType, ref, watch} from "vue";
import {renderMarkdown} from "@/plugin/markdown";
import {NoteContent} from "@/entity/Note";

const props = defineProps({
    content: Object as PropType<NoteContent>
});

const preview = ref("");

watch(() => props.content,
    value => value && renderMarkdown(value.content).then(html => preview.value = html),
    {immediate: true});

</script>
<style>
</style>
