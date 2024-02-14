<template>
    <div>
        <Mention v-model="content" :data="tags" type="textarea" placeholder="任何想法..." prefix="#" allow-clear
                   :auto-size="{minRows: 2, maxRows: 8}" ref="textareaRef" split=" "/>
        <div style="display: flex;justify-content: space-between;margin-top: 7px;">
            <ButtonGroup type="text">
                <Space>
                    <Button>
                        <template #icon>
                            <IconTag :size="16"/>
                        </template>
                    </Button>
                    <Tooltip content="引用">
                        <Button>
                            <template #icon>
                                <IconLink :size="16"/>
                            </template>
                        </Button>
                    </Tooltip>
                    <Button @click="addCheckbox()">
                        <template #icon>
                            <IconCheckSquare :size="16"/>
                        </template>
                    </Button>
                    <Button @click="addCode()">
                        <template #icon>
                            <IconCode :size="16"/>
                        </template>
                    </Button>
                </Space>
            </ButtonGroup>
            <Button type="primary" @click="add()">保存</Button>
        </div>
    </div>
</template>
<script lang="ts" setup>
import {computed, nextTick, ref} from "vue";

import {ButtonGroup, Button, Tooltip, Space, Mention} from "@arco-design/web-vue";
import {IconTag, IconLink, IconCheckSquare, IconCode} from "@arco-design/web-vue/es/icon";
import {getCursorPosition} from "@/utils/DomUtil";
import {useTagStore} from "@/store/TagStore";

const props = defineProps({
    content: String
});

const emits = defineEmits(['save']);

const content = ref(props.content || '');
const textareaRef = ref()
const tags = computed(() => useTagStore().tags);

function addCheckbox() {
    if (!textareaRef.value) {
        return;
    }
    const textarea = textareaRef.value.$refs.textareaRef as HTMLTextAreaElement;
    const cursorPosition = getCursorPosition(textarea);
    const lines = content.value.split("\n");
    lines[Math.max(cursorPosition - 1, 0)] = `- [ ] ${lines[Math.max(cursorPosition - 1, 0)]}`;
    content.value = lines.join("\n");
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
    const textarea = textareaRef.value.$refs.textareaRef as HTMLTextAreaElement;

    if (!content.value) {
        content.value = '```\n\n```';
        nextTick(() => {
            textarea.focus();
            textarea.setSelectionRange(4, 4);
        });
        return;
    }

    const cursorPosition = getCursorPosition(textarea);
    const lines = content.value.split("\n");
    lines[Math.max(cursorPosition - 1, 0)] += "\n```\n\n```";
    content.value = lines.join("\n");
    nextTick(() => {
        textarea.focus();
        const start = lines.slice(0, cursorPosition).join("\n").length - 4
        textarea.setSelectionRange(start, start);
    })
}


function add() {
    emits('save', content.value);
    content.value = "";
}


</script>
<style scoped>
</style>
