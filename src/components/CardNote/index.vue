<template>
    <a-card v-if="record" class="card" :key="record.record.id">
        <template #title>
            <span class="create-time">{{ prettyDate(record.record.id) }}</span>
            <span class="id"> · #{{ record.record.id }}</span>
        </template>
        <template #extra>
            <a-dropdown position="br">
                <a-button type="text">
                    <template #icon>
                        <icon-more-vertical/>
                    </template>
                </a-button>
                <template #content>
                    <!--                            <a-doption>-->
                    <!--                                <template #icon>-->
                    <!--                                    <icon-subscribe-add />-->
                    <!--                                </template>-->
                    <!--                                置顶-->
                    <!--                            </a-doption>-->
                    <a-doption @click="update(record)">
                        <template #icon>
                            <icon-edit/>
                        </template>
                        编辑
                    </a-doption>
                    <a-doption disabled>
                        <template #icon>
                            <icon-link/>
                        </template>
                        引用
                    </a-doption>
                    <a-doption @click="createExportImage(record.record)">
                        <template #icon>
                            <icon-shake/>
                        </template>
                        分享
                    </a-doption>
                    <a-doption disabled>
                        <template #icon>
                            <icon-bookmark/>
                        </template>
                        归档
                    </a-doption>
                    <a-doption @click="remove(record)">
                        <template #icon>
                            <icon-delete/>
                        </template>
                        删除
                    </a-doption>
                </template>
            </a-dropdown>
        </template>
        <note-preview :content="record.record"/>
    </a-card>
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

defineProps({
    record: Object as PropType<DbRecord<NoteContent>>,
});

const emits = defineEmits(['update', 'remove']);

function prettyDate(date: Date | string | number) {
    return toDateString(date);
}

function update(record: DbRecord<NoteContent>) {
    openEditBox(record)
        .then(() => {
            MessageUtil.success("更新成功")
            // 更新列表
            emits('update')
        }).catch(e => MessageUtil.error("更新失败", e))
}


function remove(record: DbRecord<NoteContent>) {
    MessageBoxUtil.confirm("是否删除此条笔记", "删除笔记")
        .then(() => useNoteStore().remove(record.record.id).then(() => {
            // 从列表中移除
            MessageUtil.success("删除成功");
            emits('remove')
        }).catch(e => MessageUtil.error("删除失败", e)))
}

</script>
<style scoped lang="less">
.card {
    margin: 7px;
    .create-time {
        font-size: .875rem;
        color: var(--color-neutral-6);
    }
    .id {
        font-size: .875rem;
        color: var(--color-neutral-6);
        display: none;
    }
    &:hover {
        .id {
            display: inline;
        }
    }
    &.preview {
        user-select: none;
        padding: 0;
        margin: 0;
        .title {
            padding: 24px 20px 0;
        }
        .body{
            padding: 0 20px;
        }
        .bottom {
            padding: 1rem 1.5rem;
            display: flex;
            justify-content: space-between;
            align-items: center;
            flex-direction: row;
            background-color: var(--color-neutral-2);
            .nickname {
                margin-left: 8px;
            }
        }
    }
}
</style>
