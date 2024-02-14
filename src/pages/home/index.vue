<template>
    <div class="home">
        <a-list @reach-bottom="fetchData()" :scrollbar="false" :bordered="false"
                :max-height="height" :split="false">
            <template #scroll-loading>
                <p v-if="bottom">No more data</p>
                <a-spin v-else/>
            </template>
            <input-box @refresh="refresh()" style="margin: 7px 7px 0;"/>
            <a-card v-for="record of records" class="card">
                <template #title>
                    <span class="create-time">{{prettyDate(record.record.createTime)}}</span>
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
                            <a-doption>
                                <template #icon>
                                    <icon-edit />
                                </template>
                                编辑
                            </a-doption>
                            <a-doption>
                                <template #icon>
                                    <icon-link />
                                </template>
                                引用
                            </a-doption>
                            <a-doption>
                                <template #icon>
                                    <icon-shake />
                                </template>
                                分享
                            </a-doption>
                            <a-doption>
                                <template #icon>
                                    <icon-bookmark />
                                </template>
                                归档
                            </a-doption>
                            <a-doption>
                                <template #icon>
                                    <icon-delete />
                                </template>
                                删除
                            </a-doption>
                        </template>
                    </a-dropdown>
                </template>
                <note-preview :content="record.record.content" />
            </a-card>
        </a-list>

    </div>
</template>
<script lang="ts" setup>
import {computed, ref} from "vue";
import {useWindowSize} from "@vueuse/core";
import {useNoteStore} from "@/store/NoteStore";
import {DbRecord} from "@/utils/utools/DbStorageUtil";
import {Note} from "@/entity/Note";
import InputBox from "@/pages/home/components/InputBox.vue";
import {toDateString} from "xe-utils";
import NotePreview from "@/pages/home/components/NotePreview.vue";

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

</script>
<style scoped lang="less">
@import "./index.less";
</style>
