<template>
    <div class="card-note">
        <div class="card-container">
            <a-row  v-if="record" :key="record.record.id" class="row">
                <a-col flex="56px">
                    <div class="avatar">
                        <role-avatar :icon="record.record.role"/>
                    </div>
                </a-col>
                <a-col flex="auto">
                    <div class="card">
                        <note-preview :content="record.record" :ellipsis="ellipsis" />
                        <div class="footer">
                            <div class="title">
                        <span class="create-time"
                              @click="openNoteInfo(record, onUpdate)">{{ prettyDate(record.record.id) }}</span>
                                <span class="id">&nbsp;· #{{ record.record.id }}</span>
                            </div>
                            <div class="extra">
                                <a-tooltip content="关系图" v-if="record.record.relationNotes.length > 0">
                                    <a-button title="关系图" type="text" @click="openNoteRelation(record)" size="mini">
                                        <template #icon>
                                            <icon-relation/>
                                        </template>
                                    </a-button>
                                </a-tooltip>
                                <a-dropdown position="br">
                                    <a-button type="text" size="mini">
                                        <template #icon>
                                            <icon-more/>
                                        </template>
                                    </a-button>
                                    <template #content>
                                        <a-doption @click="openNoteInfo(record, onUpdate)">
                                            <template #icon>
                                                <icon-info/>
                                            </template>
                                            详情
                                        </a-doption>
                                        <a-doption @click="copy(record)">
                                            <template #icon>
                                                <icon-copy/>
                                            </template>
                                            复制
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
                    </div>
                </a-col>
            </a-row>
        </div>
    </div>
</template>
<script lang="ts" setup>
import {createExportImage} from "@/components/CardNote/ExportImage";
import NotePreview from "@/components/CardNote/NotePreview.vue";
import {PropType} from "vue";
import {NoteContent} from "@/entity/Note";
import {DbRecord} from "@/utils/utools/DbStorageUtil";
import {openEditBox} from "@/pages/home/module/EditBox";
import MessageUtil from "@/utils/modal/MessageUtil";
import {useNoteStore} from "@/store/NoteStore";
import MessageBoxUtil from "@/utils/modal/MessageBoxUtil";
import {toDateString} from "xe-utils";
import {openNoteInfo} from "@/pages/note";
import {openNoteRelation} from "@/pages/note/relation";
import RoleAvatar from "@/components/RoleAvatar/index.vue";

defineProps({
    record: Object as PropType<DbRecord<NoteContent>>,
    ellipsis: {
        type: Boolean,
        default: true,
    }
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

function copy(record: DbRecord<NoteContent>) {
    utools.copyText(record.record.content);
    MessageUtil.success("已成功复制到剪贴板")
}

</script>
<style scoped lang="less">
.card-note {
    width: 100%;

    .row {
        flex-wrap: nowrap;
    }

    .avatar {
        padding-top: 16px;
        padding-left: 16px;
    }

    .create-time {
        font-size: 0.8rem;
    }
}
</style>
