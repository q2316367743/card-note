<template>
    <div class="calendar">
        <div class="card card-container">
            <calendar ref="calendarRef" expanded :is-dark="dark" v-model="now" @dayclick="dayClick"
                      :attributes="heatmap"/>
        </div>
        <div class="card no-bg" style="margin-top: 14px;" v-if="keywords.length > 0">
            <span>过滤器：</span>
            <a-tag v-for="keyword in keywords" :key="keyword" closable color="arcoblue" @close="removeKeyword(keyword)">
                <span style="width: 1rem">#</span>
                {{ keyword }}
            </a-tag>
        </div>
        <a-timeline class="card-container">
            <a-timeline-item v-for="note of notes" :key="note.record.id">
                <div style="margin-bottom: 7px;">{{ renderLabel(note.record.id) }}</div>
                <div class="card">
                    <note-preview :content="note.record"/>
                </div>
            </a-timeline-item>
        </a-timeline>
        <a-back-top target-container=".calendar" :style="{bottom: isMobile ? '80px' : '48px'}"/>
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
import {useNoteStore, useSearchNoteEvent} from "@/store/NoteStore";
import {useAppStore} from "@/store/AppStore";

const now = new Date();

const keywords = ref<Array<string>>([]);
const calendarRef = ref<InstanceType<typeof Calendar> | null>()
const date = ref(new Date(now.getFullYear(), now.getMonth(), now.getDate(), 8, 0, 0, 0));
const records = ref<Array<DbRecord<NoteContent>>>(new Array<DbRecord<NoteContent>>());

const dark = computed(() => useAppStore().dark);
const isMobile = computed(() => useAppStore().isMobile);
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
const notes = computed(() => {
    if (keywords.value.length === 0) {
        return records.value;
    }

    return records.value.filter(record => keywords.value.every(keyword => record.record.content.includes(`#${keyword}`)));
})

function dayClick(args: any) {
    keywords.value = [];
    records.value = [];
    try {
        LA.track('show_day');
    } catch (e) {
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

function removeKeyword(tag: string) {
    keywords.value = keywords.value.filter(keyword => keyword !== tag);
}

useSearchNoteEvent.reset();
useSearchNoteEvent.on(tag => {
    if (keywords.value.indexOf(tag) === -1) {
        keywords.value.push(tag);
    }
});

</script>
<style>
@import "./index.less";
</style>
