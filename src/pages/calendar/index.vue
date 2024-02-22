<template>
    <div class="calendar">
        <div class="card">
            <calendar ref="calendarRef" expanded :is-dark="dark" v-model="now" @dayclick="dayClick"
                      :attributes="heatmap"/>
        </div>

        <a-timeline style="margin: 14px auto 0;max-width: 730px;">
            <a-timeline-item v-for="record of records" :key="record.record.id">
                <div style="margin-bottom: 7px;">{{ renderLabel(record.record.id) }}</div>
                <div class="card">
                    <note-preview :content="record.record"/>
                </div>
            </a-timeline-item>
        </a-timeline>
        <a-back-top target-container=".calendar"/>
    </div>
</template>
<script lang="ts" setup>
import {computed, ref, toRaw} from "vue";
import {toDateString} from "xe-utils";
import 'v-calendar/style.css';
import {Calendar} from "v-calendar";
import NotePreview from "@/components/CardNote/NotePreview.vue";
import {DbRecord} from "@/utils/utools/DbStorageUtil";
import {NoteContent} from "@/entity/Note";
import {useNoteStore} from "@/store/NoteStore";
import {useAppStore} from "@/store/AppStore";

const now = new Date();

const calendarRef = ref<InstanceType<typeof Calendar> | null>()
const date = ref(new Date(now.getFullYear(), now.getMonth(), now.getDate(), 8, 0, 0, 0));
const records = ref<Array<DbRecord<NoteContent>>>(new Array<DbRecord<NoteContent>>());

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
        list.push({
            key: k,
            dates: new Date(k),
            count: v,
            dot: {
                style: {
                    backgroundColor: renderColor(v)
                }
            },
        });
    });

    return list;

});


function dayClick(args: any) {
    records.value = [];
    try {
        LA.track('show_day');
    }catch (e) {
        console.error(e);
    }
    useNoteStore().init().then(() => useNoteStore().oneDay(new Date(toRaw(args).date).getTime())
        .then(items => records.value = items));
}

function renderLabel(id: number) {
    return toDateString(id, "HH:mm:ss");
}

const COLOR_LIST = ['9BE9A8', '40C463', '30A14E', '216E39'];

function wrap(count: number) {
    if (count < 4) {
        return COLOR_LIST[0];
    } else if (count < 9) {
        return COLOR_LIST[1];
    } else if (count < 16) {
        return COLOR_LIST[2];
    } else {
        return COLOR_LIST[3];
    }
}

function renderColor(count: number): string {
    return `#${wrap(count)}`;
}

</script>
<style>
@import "./index.less";
</style>
