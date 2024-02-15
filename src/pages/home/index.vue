<template>
    <div class="home">
        <a-list @reach-bottom="fetchData()" :scrollbar="false" :bordered="false"
                :max-height="height" :split="false">
            <template #scroll-loading>
                <p v-if="bottom">没有更多的笔记了</p>
                <a-spin v-else/>
            </template>
            <input-box @refresh="refresh()" style="margin: 7px 7px 0;"/>
            <card-note v-for="(record, index) of records" :record="record" :key="record.record.id"
                       @update="e=>update(record, index, e)" @remove="remove(index)"/>
        </a-list>
        <a-back-top target-container=".arco-list"/>
    </div>
</template>
<script lang="ts" setup>
import {computed, ref} from "vue";
import {useWindowSize} from "@vueuse/core";
import {useNoteStore} from "@/store/NoteStore";
import {DbRecord} from "@/utils/utools/DbStorageUtil";
import {NoteContent} from "@/entity/Note";
import InputBox from "@/pages/home/module/InputBox.vue";
import CardNote from "@/components/CardNote/index.vue";

const size = useWindowSize();

const records = ref<Array<DbRecord<NoteContent>>>(new Array<DbRecord<NoteContent>>());
const bottom = ref(false);

const height = computed(() => size.height.value - 14);

let offset = 0;
const limit = 10;

const page = () => useNoteStore().init().then(() => useNoteStore().page(offset, limit).then(items => {
    items.forEach(item => records.value.push(item));
    if (items.length < limit) {
        bottom.value = true;
    }
}));

function fetchData() {
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
    useNoteStore().getOne(record.record.id).then(item => item && (records.value[index] = item));
    for (let i = 0; i < records.value.length; i++) {
        let one = records.value[i].record;
        if (needUpdateIds.indexOf(one.id) > -1) {
            // 存在
            useNoteStore().getOne(one.id).then(item => item && (records.value[i] = item));
        }
    }
}


function remove(index: number) {
    records.value.splice(index, 1);
}

</script>
<style lang="less">
@import "./index.less";
</style>
