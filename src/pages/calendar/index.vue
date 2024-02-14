<template>
    <div class="calendar">
        <div>
            <a-date-picker style="width: 200px;" v-model="date" :allow-clear="false"/>
        </div>
        <a-timeline  style="margin-top: 14px;">
            <a-timeline-item v-for="record of records" :key="record.record.id">
                <div style="margin-bottom: 7px;">{{renderLabel(record.record.id)}}</div>
                <a-card><note-preview :content="record.record" /></a-card>
            </a-timeline-item>
        </a-timeline>
    </div>
</template>
<script lang="ts" setup>
import {ref, watch} from "vue";
import {DbRecord} from "@/utils/utools/DbStorageUtil";
import {NoteContent} from "@/entity/Note";
import {useNoteStore} from "@/store/NoteStore";
import NotePreview from "@/components/CardNote/NotePreview.vue";
import {toDateString} from "xe-utils";

const now = new Date();
const date = ref(new Date(now.getFullYear(), now.getMonth(), now.getDate(), 8, 0, 0, 0));

const records = ref<Array<DbRecord<NoteContent>>>(new Array<DbRecord<NoteContent>>());

watch(date, value => {
    records.value = [];
    useNoteStore().init().then(() => useNoteStore().oneDay(new Date(value).getTime())
        .then(items => records.value = items));
}, {immediate: true});

function renderLabel(id: number) {
    return  toDateString(id, "HH:mm:ss");
}
</script>
<style scoped>
.calendar {
    padding: 7px;
}
</style>
