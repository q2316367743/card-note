<template>
    <div class="home">
        <a-list @reach-bottom="fetchData()" :scrollbar="false" :bordered="false"
                :max-height="height" :split="false">
            <template #scroll-loading>
                <p v-if="bottom">没有更多的笔记了</p>
                <a-spin v-else/>
            </template>
            <input-box @refresh="refresh()" style="margin: 7px 7px 0;"/>
            <a-card v-for="(record, index) of records" class="card" :key="record.record.id">
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
                            <a-doption @click="update(record, index)">
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
                            <a-doption @click="remove(record, index)">
                                <template #icon>
                                    <icon-delete/>
                                </template>
                                删除
                            </a-doption>
                        </template>
                    </a-dropdown>
                </template>
                <note-preview :content="record.record.content" class="juejin"/>
            </a-card>
        </a-list>
        <a-back-top target-container=".arco-list"/>
    </div>
</template>
<script lang="ts" setup>
import {computed, ref} from "vue";
import {useWindowSize} from "@vueuse/core";
import {useNoteStore} from "@/store/NoteStore";
import {DbRecord} from "@/utils/utools/DbStorageUtil";
import {Note} from "@/entity/Note";
import InputBox from "@/pages/home/module/InputBox.vue";
import {toDateString} from "xe-utils";
import NotePreview from "@/pages/home/module/NotePreview.vue";
import {openEditBox} from "@/pages/home/module/EditBox";
import MessageBoxUtil from "@/utils/MessageBoxUtil";
import MessageUtil from "@/utils/MessageUtil";
import {createExportImage} from "@/pages/home/components/ExportImage";

const size = useWindowSize();

const records = ref<Array<DbRecord<Note>>>(new Array<DbRecord<Note>>());
const bottom = ref(false);

const height = computed(() => size.height.value - 14);

let offset = 0;
const limit = 10;

const page = () => useNoteStore().page(offset, limit).then(items => {
    items.forEach(item => records.value.push(item));
    if (items.length < limit) {
        bottom.value = true;
    }
});

function fetchData() {
    offset = records.value.length;
    page();
}

function refresh() {
    offset = 0;
    records.value = new Array<DbRecord<Note>>();
    bottom.value = false;
    page();
}

function prettyDate(date: Date | string | number) {
    return toDateString(date);
}

useNoteStore().init().then(page);

function update(record: DbRecord<Note>, index: number) {
    openEditBox(record)
        .then(() => {
            MessageUtil.success("更新成功")
            // 更新列表
            useNoteStore().getOne(record.record.id).then(item => item && (records.value[index] = item))
        }).catch(e => MessageUtil.error("更新失败", e))
}


function remove(record: DbRecord<Note>, index: number) {
    MessageBoxUtil.confirm("是否删除此条笔记", "删除笔记")
        .then(() => useNoteStore().remove(record.record.id).then(() => {
            // 从列表中移除
            records.value.splice(index, 1);
            MessageUtil.success("删除成功")
        }).catch(e => MessageUtil.error("删除失败", e)))
}

</script>
<style lang="less">
@import "./index.less";
</style>
