<template>
    <a-layout class="home">
        <a-list @reach-bottom="fetchData()" :scrollbar="false" :bordered="false"
                :max-height="height" :split="false">
            <template #scroll-loading>
                <p v-if="bottom">人家也是有底线的[○･｀Д´･ ○]</p>
                <a-spin tip="正在加载中" v-else/>
            </template>
            <!-- 输入框 -->
            <input-box v-show="keywords.length === 0" @add="onAdd" class="card card-container" style="margin-top: 0;"/>
            <!-- 过滤器 -->
            <a-row v-if="keywords.length > 0" class="card no-bg card-container">
                <a-col flex="auto">
                    <a-space>
                        <span>过滤器：</span>
                        <a-tag v-for="keyword of keywords" :key="keyword.type+keyword.value" class="keyword" closable
                               @close="keywordRemove(keyword)" color="arcoblue">
                            <span v-if="keyword.type === 'TAG'" style="width: 1rem">#</span>
                            <span v-if="keyword.type === 'KEY'" style="width: 1rem">
                                <icon-search/>
                            </span>
                            <span>{{ keyword.value }}</span>
                        </a-tag>
                    </a-space>
                </a-col>
                <a-col flex="24px">
                    <a-dropdown position="br">
                        <a-button type="text" size="mini" style="float: right">
                            <template #icon>
                                <icon-more-vertical/>
                            </template>
                        </a-button>
                        <template #content>
                            <a-doption @click="exportOneFile()">导出</a-doption>
                            <a-doption :disabled="disabledAi" @click="askMultiNoteToAiWarp()">询问AI</a-doption>
                        </template>
                    </a-dropdown>
                </a-col>
            </a-row>
            <!-- 实际的卡片 -->
            <card-note v-for="(record, index) of records" :record="record" :key="record.record.id"
                       :ellipsis="keywords.length === 0"
                       @update="e=>update(record, index, e)" @remove="e=>remove(index, e)"/>
        </a-list>
        <!-- 返回顶部 -->
        <a-back-top target-container=".arco-list" ref="backTopInstance"/>
    </a-layout>
</template>
<script lang="ts" setup>
import {computed, ref, watch} from "vue";
import {useWindowSize} from "@vueuse/core";
import {DbRecord} from "@/utils/utools/DbStorageUtil";
import {NoteContent} from "@/entity/Note";
import InputBox from "@/pages/home/module/InputBox.vue";
import CardNote from "@/components/CardNote/index.vue";
import {openNoteInfo} from "@/pages/note";
import {
    useNoteStore,
    useOpenNoteEvent,
    useRefreshNoteEvent,
    useSearchNoteEvent
} from "@/store/NoteStore";
import {BackTopInstance} from "@arco-design/web-vue/es/back-top";
import {exportOneMarkdown} from "@/components/ImportOrExport/ExportOneMarkdown";
import {useAiStore} from "@/store/AiStore";
import {askMultiNoteToAi} from "@/pages/home/module/AskMultiNoteToAi";
import {useSubInput} from "@/hooks/SubInput";
import {useRoute} from "vue-router";

const size = useWindowSize();
const route = useRoute();

interface Keyword {
    type: 'TAG' | 'KEY';
    value: string
}

let offset = 0;
const limit = 10;

const {onSearch, setSubInput} = useSubInput('', '请输入关键字、标签，回车搜索', false);

const keywords = ref<Array<Keyword>>([]);
const records = ref<Array<DbRecord<NoteContent>>>(new Array<DbRecord<NoteContent>>());
const bottom = ref(false);
const backTopInstance = ref<BackTopInstance | null>(null);

// 是否是手机客户端
const height = computed(() => size.height.value - 47);
const disabledAi = computed(() => useAiStore().disabled);

watch(keywords, value => value.length === 0 ? refresh() : search(), {deep: true});

watch(() => route.query, value => {
    const keyword = `${value?.keyword || ''}`;
    if (keyword) {
        keyAdd(keyword);
    }
}, {immediate: true, deep: true})

const onPage = () => useNoteStore().init().then(() => useNoteStore().page(offset, limit).then(items => {
    items.forEach(item => records.value.push(item));
    if (items.length < limit) {
        bottom.value = true;
    }
}));

const _onSearch = () => useNoteStore()
    .search(keywords.value.map(e => e.type === 'TAG' ? `#${e.value}` : e.value))
    .then(items => records.value = items)
    .then(() => backTopInstance.value && backTopInstance.value.scrollToTop());

function fetchData() {
    if (bottom.value) {
        return;
    }
    offset = records.value.length;
    if (keywords.value.length === 0) {
        onPage();
    } else {
        search();
    }
}

function refresh() {
    if (keywords.value.length === 0) {
        offset = 0;
        records.value = new Array<DbRecord<NoteContent>>();
        bottom.value = false;
        onPage();
    } else {
        keywords.value = [];
    }
}

function search() {
    offset = 0;
    records.value = new Array<DbRecord<NoteContent>>();
    bottom.value = true;
    _onSearch();
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

function onAdd(id: number, ids: Array<number>) {
    useNoteStore().getOne(id).then(content => {
        content && (records.value.unshift(content));
        onUpdate(ids);
    });
}

function keywordAdd(keyword: Keyword) {
    if (keywords.value.findIndex(item => item.value === keyword.value && item.type === keyword.type) === -1) {
        keywords.value.push(keyword)
    }

}

function tagAdd(tag: string) {
    keywordAdd({
        type: 'TAG',
        value: tag
    });
    backTopInstance.value && backTopInstance.value.scrollToTop();
}

function keyAdd(keyword: string) {
    if (keyword.trim() === '') {
        return;
    }
    keywordAdd({
        type: 'KEY',
        value: keyword
    });
}

function keywordRemove(keyword: Keyword) {
    keywords.value = keywords.value.filter(item => item.value !== keyword.value || item.type !== keyword.type);
}

function exportOneFile() {
    exportOneMarkdown(records.value);
}

function askMultiNoteToAiWarp() {
    askMultiNoteToAi(records.value);
}

useSearchNoteEvent.reset();
useSearchNoteEvent.on(tagAdd);
useRefreshNoteEvent.reset();
useRefreshNoteEvent.on(ids => {
    if (ids) {
        onUpdate(ids)
    } else {
        refresh();
    }
});

onSearch(res => {
    keyAdd(res);
    setSubInput('');
})

</script>
<style lang="less">
@import "./index.less";
</style>
