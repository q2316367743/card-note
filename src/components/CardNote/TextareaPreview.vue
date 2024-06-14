<template>
    <div class="juejin" v-html="preview"></div>
</template>
<script lang="ts" setup>
import {ref, watch} from "vue";
import {renderMarkdown} from "@/plugin/markdown";

const props = defineProps({
    content: String
});

const preview = ref("");

watch(() => props.content,
    value => renderMarkdown(value).then(html => preview.value = html),
    {immediate: true});

</script>
<style scoped>

</style>
