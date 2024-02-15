<template>
    <div class="search">
        <a-input-search placeholder="请输入笔记内容，搜索内容需要连续" v-model="keyword" @search="search()"
                        @keydown.enter="search()" @clear="clear()" :loading="searching" allow-clear/>
        <div class="container">
            <a-card v-for="record in records" :key="record.record.id" class="search-item">
                <note-preview :content="record.record"/>
            </a-card>
            <a-result title="搜索中" v-if="searching">
                <template #icon>
                    <icon-refresh :size="48"/>
                </template>
            </a-result>
        </div>
        <a-back-top target-container=".search .container" />
    </div>
</template>
<script lang="ts" setup>
import {onUnmounted, ref} from "vue";
import {DbRecord} from "@/utils/utools/DbStorageUtil";
import {NoteContent} from "@/entity/Note";
import NotePreview from "@/components/CardNote/NotePreview.vue";
import {useNoteStore} from "@/store/NoteStore";
import {toDateString} from "xe-utils";

const searching = ref(false);
const keyword = ref("");
const records = ref<Array<DbRecord<NoteContent>>>(new Array<DbRecord<NoteContent>>());

function prettyDate(date: Date | string | number) {
    return toDateString(date);
}

function clear() {
    searching.value = false;
    records.value = [];
}

async function search() {
    clear()
    try {
        searching.value = true;
        await useNoteStore().init()
        const ids = useNoteStore().allIds();
        for (let id of ids) {
            if (!searching.value) {
                return;
            }
            const record = await useNoteStore().getOne(id);
            if (record) {
                if (record.record.content.indexOf(keyword.value) > -1) {
                    records.value.push(record);
                }
            }
        }
    } finally {
        searching.value = false;
    }
}

onUnmounted(() => searching.value = false);

</script>
<style lang="less">
.search {
    position: absolute;
    top: 7px;
    left: 7px;
    right: 7px;
    bottom: 7px;

    .container {
        position: absolute;
        top: 39px;
        left: 0;
        right: 0;
        bottom: 0;
        overflow: auto;

        .search-item {
            margin-top: 7px;

            &:first-child {
                margin: 0;
            }
        }
    }
}
</style>
