<template>
    <a-card style="border: none;">
        <text-editor @save="add"/>
    </a-card>
</template>
<script lang="ts" setup>
import {useNoteStore} from "@/store/NoteStore";
import MessageUtil from "@/utils/modal/MessageUtil";
import TextEditor from "@/components/TextEditor/index.vue";
import {NoteAdd} from "@/entity/Note";
import {statistics} from "@/plugin/statistics";

const emits = defineEmits(['add']);


function add(note: NoteAdd) {
    if (!note.content) {
        MessageUtil.warning("请输入内容");
        return;
    }
    useNoteStore().add(note.content, note.relationNotes, note.role)
        .then(content => {
            statistics.track('create_note');
            MessageUtil.success("新增成功");
            emits('add', content.id, content.relationNotes.map(e => e.relationId));
        })
        .catch(e => MessageUtil.error("新增失败", e));
}


</script>
<style scoped>
</style>
