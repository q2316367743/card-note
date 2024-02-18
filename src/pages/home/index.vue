<template>
    <a-layout class="home">
        <a-layout-header class="header">
            <div class="title">MEMO</div>
            <div class="statistics">在过去的 {{ day }} 天中，共记录 {{ noteLength }} 条笔记</div>
        </a-layout-header>
            <a-layout-content>
                <a-list @reach-bottom="fetchData()" :scrollbar="false" :bordered="false"
                        :max-height="height" :split="false">
                    <template #scroll-loading>
                        <p v-if="bottom">没有更多的笔记了</p>
                        <a-spin v-else/>
                    </template>
                    <input-box @refresh="refresh()" class="card"/>
                    <div v-if="keywords.length > 0" class="card">过滤器：
                        <a-tag v-for="keyword of keywords" :key="keyword" class="keyword" closable
                               @close="keywordRemove(keyword)" color="arcoblue">
                            <span v-if="keyword.type === 'TAG'" style="width: 1rem">#</span>
                            <span v-if="keyword.type === 'KEY'" style="width: 1rem">
                            <icon-search/>
                        </span>
                            <span>{{ keyword.value }}</span>
                        </a-tag>
                    </div>
                    <card-note v-for="(record, index) of records" :record="record" :key="record.record.id"
                               @update="e=>update(record, index, e)" @remove="e=>remove(index, e)"/>
                </a-list>
                <a-back-top target-container=".arco-list"/>
            </a-layout-content>
        </a-layout>
</template>
<script lang="ts" setup>
import {computed, ref} from "vue";
import {useWindowSize} from "@vueuse/core";
import {DbRecord} from "@/utils/utools/DbStorageUtil";
import {NoteContent} from "@/entity/Note";
import InputBox from "@/pages/home/module/InputBox.vue";
import CardNote from "@/components/CardNote/index.vue";
import {openNoteInfo} from "@/pages/note";
import {useTagStore} from "@/store/TagStore";
import {useNoteStore, useOpenNoteEvent, useResetNoteEvent} from "@/store/NoteStore";

const size = useWindowSize();

const records = ref<Array<DbRecord<NoteContent>>>(new Array<DbRecord<NoteContent>>());
const bottom = ref(false);

const height = computed(() => size.height.value - 39);
const tags = computed(() => useTagStore().tags);
const allIds = computed(() => useNoteStore().allIds())
const noteLength = computed(() => allIds.value.length);
const minDay = computed(() => Math.min(...allIds.value));
const day = computed(() => Math.floor(((new Date().getTime()) - minDay.value) / (24 * 60 * 60 * 1000)));

interface Keyword {
    type: 'TAG' | 'KEY';
    value: string
}

const keyword = ref('');
const keywords = ref<Array<Keyword>>([]);

let offset = 0;
const limit = 10;

const page = () => useNoteStore().init().then(() => useNoteStore().page(offset, limit).then(items => {
    items.forEach(item => records.value.push(item));
    if (items.length < limit) {
        bottom.value = true;
    }
}));

function fetchData() {
    if (bottom.value) {
        return;
    }
    offset = records.value.length;
    page();
}

function refresh() {
    offset = 0;
    records.value = new Array<DbRecord<NoteContent>>();
    bottom.value = false;
    page();
}


function update(record: DbRecord<NoteContent>, index: number, needUpdateIds: Array<number>) {
    if (index > -1) {
        useNoteStore().getOne(record.record.id).then(item => item && (records.value[index] = item));
    }
    onUpdate(needUpdateIds);
}

useOpenNoteEvent.reset();
useOpenNoteEvent.on(id => {
    useNoteStore().getOne(id)
        .then(res => {
            if (res) {
                openNoteInfo(res, needUpdateIds => update(res, records.value.findIndex(item => item.record.id === res.record.id), needUpdateIds))
            }
        })
});
useResetNoteEvent.reset();
useResetNoteEvent.on(refresh)

function remove(index: number, needUpdateIds: Array<number>) {
    records.value.splice(index, 1);
    onUpdate(needUpdateIds);
}

function onUpdate(needUpdateIds: Array<number>) {
    if (needUpdateIds.length > 0) {
        for (let i = 0; i < records.value.length; i++) {
            let one = records.value[i].record;
            if (needUpdateIds.indexOf(one.id) > -1) {
                // 存在
                useNoteStore().getOne(one.id).then(item => item && (records.value[i] = item));
            }
        }
    }
}

function tagAdd(tag: string) {
    keywordAdd({
        type: 'TAG',
        value: tag
    })
}

function keyAdd() {
    if (keyword.value.trim() === '') {
        return;
    }
    keywordAdd({
        type: 'KEY',
        value: keyword.value
    });
    keyword.value = '';
}

function keywordAdd(keyword: Keyword) {
    if (keywords.value.findIndex(item => item.value === keyword.value && item.type === keyword.type) === -1) {
        keywords.value.push(keyword)
    }

}

function keywordRemove(keyword: Keyword) {
    keywords.value = keywords.value.filter(item => item.value !== keyword.value || item.type !== keyword.type);
}


</script>
<style lang="less">
@import "./index.less";
</style>
