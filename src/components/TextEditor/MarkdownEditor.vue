<template>
    <a-mention v-model="modelValue" :data="options" type="textarea" placeholder="任何想法..."
               :prefix="['#', '@']" allow-clear :auto-size="{minRows: 2, maxRows: 8}" ref="textareaRef" split=" "
               @search="onSearch"/>
</template>
<script lang="ts" setup>

import {useAiStore} from "@/store/AiStore";
import {computed, nextTick, ref} from "vue";
import {useTagStore} from "@/store/TagStore";
import {getCursorPosition} from "@/utils/DomUtil";

const modelValue = defineModel({
    type: String,
    default: ''
});

const options = ref<Array<string>>([]);
const textareaRef = ref()

const tags = computed(() => Array.from(useTagStore().tags));

function onSearch(_value: string, prefix: string) {
    if (prefix === '#') {
        options.value = tags.value;
    } else if (prefix === '@') {
        if (useAiStore().disabled) {
            options.value = [];
        } else {
            options.value = ['AI助手 '];
        }
    } else {
        options.value = [];
    }
}

function addCheckbox() {
    if (!textareaRef.value) {
        return;
    }
    const textarea = textareaRef.value.inputRef.$refs.textareaRef as HTMLTextAreaElement;
    const cursorPosition = getCursorPosition(textarea);
    const lines = modelValue.value.split("\n");
    lines[Math.max(cursorPosition - 1, 0)] = `- [ ] ${lines[Math.max(cursorPosition - 1, 0)]}`;
    modelValue.value = lines.join("\n");
    nextTick(() => {
        textarea.focus();
        const start = lines.slice(0, cursorPosition).join("\n").length
        textarea.setSelectionRange(start, start);
    })
}

function addCode() {

    if (!textareaRef.value) {
        return;
    }
    const textarea = textareaRef.value.inputRef.$refs.textareaRef as HTMLTextAreaElement;

    if (!modelValue.value) {
        modelValue.value = '```\n\n```';
        nextTick(() => {
            textarea.focus();
            textarea.setSelectionRange(4, 4);
        });
        return;
    }

    const cursorPosition = getCursorPosition(textarea);
    const lines = modelValue.value.split("\n");
    lines[Math.max(cursorPosition - 1, 0)] += "\n```\n\n```";
    modelValue.value = lines.join("\n");
    nextTick(() => {
        textarea.focus();
        const start = lines.slice(0, cursorPosition).join("\n").length - 4
        textarea.setSelectionRange(start, start);
    })
}

const TABLE_TEMPLATE = '|  |  |\n|---|---|\n|  |  |';

function addTable() {

    if (!textareaRef.value) {
        return;
    }
    const textarea = textareaRef.value.inputRef.$refs.textareaRef as HTMLTextAreaElement;

    if (!modelValue.value) {
        modelValue.value = TABLE_TEMPLATE;
        nextTick(() => {
            textarea.focus();
            textarea.setSelectionRange(2, 2);
        });
        return;
    }

    const cursorPosition = getCursorPosition(textarea);
    const lines = modelValue.value.split("\n");
    lines[Math.max(cursorPosition - 1, 0)] += ('\n' + TABLE_TEMPLATE);
    modelValue.value = lines.join("\n");
    nextTick(() => {
        textarea.focus();
        const start = lines.slice(0, cursorPosition).join("\n").length - 23
        textarea.setSelectionRange(start, start);
    })
}

defineExpose({addCheckbox, addTable, addCode});

</script>
<style lang="less">
</style>
