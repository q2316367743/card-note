<template>
    <a-card>
        <text-editor @save="add"/>
    </a-card>
</template>
<script lang="ts" setup>
import {useNoteStore} from "@/store/NoteStore";
import MessageUtil from "@/utils/MessageUtil";
import TextEditor from "@/components/TextEditor/index.vue";
import {NoteRelation} from "@/entity/Note";

const emits = defineEmits(['refresh']);


function add(content: string, relationNotes: Array<NoteRelation>) {
    if (!content) {
        MessageUtil.warning("请输入内容");
        return;
    }
    useNoteStore().add(content, relationNotes)
        .then(() => {
            LA.track('create_note');
            MessageUtil.success("新增成功");
            emits('refresh');
        })
        .catch(e => MessageUtil.error("新增失败", e));
}


</script>
<style scoped>
</style>
