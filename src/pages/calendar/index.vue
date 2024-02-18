<template>
    <div class="calendar">
        <div>
            <calendar-heatmap :dark-mode="dark" tooltip-unit="条笔记" :values="heatmap" :end-date="new Date()"
                              no-data-text="没有笔记" @day-click="dayClick" :tooltip-formatter="tooltipFormatter"/>
        </div>
        <a-timeline style="margin-top: 14px;">
            <a-timeline-item v-for="record of records" :key="record.record.id">
                <div style="margin-bottom: 7px;">{{ renderLabel(record.record.id) }}</div>
                <a-card>
                    <note-preview :content="record.record"/>
                </a-card>
            </a-timeline-item>
        </a-timeline>
        <a-back-top target-container=".calendar"/>
    </div>
</template>
<script lang="ts" setup>
import {computed, ref, toRaw} from "vue";
import {DbRecord} from "@/utils/utools/DbStorageUtil";
import {NoteContent} from "@/entity/Note";
import {useNoteStore} from "@/store/NoteStore";
import NotePreview from "@/components/CardNote/NotePreview.vue";
import {toDateString} from "xe-utils";
import {CalendarHeatmap} from "vue3-calendar-heatmap";
import {useAppStore} from "@/store/AppStore";

const now = new Date();
const date = ref(new Date(now.getFullYear(), now.getMonth(), now.getDate(), 8, 0, 0, 0));
const dark = computed(() => useAppStore().dark);
const heatmap = computed(() => {
    const dailyRecordMap = new Map<string, number>();

    for (let id of useNoteStore().allIds()) {
        const time = toDateString(id, "yyyy-MM-dd");
        const count = dailyRecordMap.get(time);
        if (count) {
            dailyRecordMap.set(time, count + 1);
        } else {
            dailyRecordMap.set(time, 1);
        }
    }

    const list: any[] = [];

    dailyRecordMap.forEach((v, k) => {
        list.push({date: k, count: v});
    });

    return list;

})

const records = ref<Array<DbRecord<NoteContent>>>(new Array<DbRecord<NoteContent>>());

function dayClick(args: any) {
    records.value = [];
    useNoteStore().init().then(() => useNoteStore().oneDay(new Date(toRaw(args).date).getTime())
        .then(items => records.value = items));
}

function renderLabel(id: number) {
    return toDateString(id, "HH:mm:ss");
}
function tooltipFormatter(args: any): string {
    const date =  toDateString(toRaw(args).date, "yyyy/MM/dd");
    return `${date} 记了 ${args.count} 条笔记`
}
</script>
<style>
.calendar {
    position: absolute;
    top: 7px;
    left: 7px;
    right: 7px;
    bottom: 7px;
    overflow: auto;
}
.vch__month__label {
    fill: var(--color-text-1);
}
.vch__day__label {
    fill: var(--color-text-1);
}
</style>
