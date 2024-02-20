<template>
    <div v-if="record" class="card" :key="record.record.id">
        <div class="header">
            <div class="title">
                <span class="create-time" @click="openNoteInfo(record, onUpdate)">{{
                        prettyDate(record.record.id)
                    }}</span>
                <span class="id"> · #{{ record.record.id }}</span>
            </div>
            <div class="extra">
                <a-dropdown position="br">
                    <a-button type="text">
                        <template #icon>
                            <icon-more-vertical/>
                        </template>
                    </a-button>
                    <template #content>
                        <a-doption @click="openNoteInfo(record, onUpdate)">
                            <template #icon>
                                <icon-info/>
                            </template>
                            详情
                        </a-doption>
                        <a-doption @click="update(record)">
                            <template #icon>
                                <icon-edit/>
                            </template>
                            编辑
                        </a-doption>
                        <a-doption @click="createExportImage(record.record)">
                            <template #icon>
                                <icon-shake/>
                            </template>
                            分享
                        </a-doption>
                        <a-doption @click="remove(record)">
                            <template #icon>
                                <icon-delete/>
                            </template>
                            删除
                        </a-doption>
                    </template>
                </a-dropdown>
            </div>
        </div>
        <note-preview :content="record.record"/>
    </div>
</template>
<script lang="ts" setup>
import {createExportImage} from "@/components/CardNote/ExportImage";
import NotePreview from "@/components/CardNote/NotePreview.vue";
import {PropType} from "vue";
import {NoteContent} from "@/entity/Note";
import {DbRecord} from "@/utils/utools/DbStorageUtil";
import {openEditBox} from "@/pages/home/module/EditBox";
import MessageUtil from "@/utils/MessageUtil";
import {useNoteStore} from "@/store/NoteStore";
import MessageBoxUtil from "@/utils/MessageBoxUtil";
import {toDateString} from "xe-utils";
import {openNoteInfo} from "@/pages/note";

defineProps({
    record: Object as PropType<DbRecord<NoteContent>>,
});

const emits = defineEmits(['update', 'remove']);

function prettyDate(date: Date | string | number) {
    return toDateString(date);
}

function update(record: DbRecord<NoteContent>) {
    openEditBox(record)
        .then(needUpdateIds => {
            MessageUtil.success("更新成功")
            // 更新列表
            onUpdate(needUpdateIds)
        }).catch(e => MessageUtil.error("更新失败", e))
}


function remove(record: DbRecord<NoteContent>) {
    MessageBoxUtil.confirm("是否删除此条笔记", "删除笔记")
        .then(() => useNoteStore().remove(record.record.id)
            .then(needUpdateIds => {
                // 从列表中移除
                MessageUtil.success("删除成功");
                emits('remove', needUpdateIds)
            }).catch(e => MessageUtil.error("删除失败", e)))
}

function onUpdate(needUpdateIds: Array<number>) {
    emits('update', needUpdateIds)
}

</script>
<style>
</style>
