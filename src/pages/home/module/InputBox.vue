<template>
    <a-card>
        <text-editor @save="e => add(e)"/>
    </a-card>
</template>
<script lang="ts" setup>
import {useNoteStore} from "@/store/NoteStore";
import MessageUtil from "@/utils/MessageUtil";
import TextEditor from "@/pages/home/components/TextEditor.vue";

const emits = defineEmits(['refresh']);


function add(content: string) {
    if (!content) {
        MessageUtil.warning("请输入内容");
        return;
    }
    useNoteStore().add(content, [])
        .then(() => {
            MessageUtil.success("新增成功");
            emits('refresh');
        })
        .catch(e => MessageUtil.error("新增失败", e));
}


</script>
<style scoped>
</style>
