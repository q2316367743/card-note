<template>
    <div class="statistics">
        <div class="card card-container">
            <div class="label">
                <a-month-picker v-model="date" :allow-clear="false"/>
            </div>
            <div class="content">
                <a-row>
                    <a-col :span="8" style="text-align: center">
                        <a-statistic extra="笔记" :value="count"/>
                    </a-col>
                    <a-col :span="8" style="text-align: center">
                        <a-statistic extra="单日最多条数" :value="max"/>
                    </a-col>
                    <a-col :span="8" style="text-align: center">
                        <a-statistic extra="坚持记录天数" :value="continuous"/>
                    </a-col>
                </a-row>
            </div>
        </div>
        <div class="card card-container">
            <div class="label">最近一年一共记录 {{ total }} 条 MEMO</div>
            <div class="content">
                <calendar-heatmap :values="dayCount" :end-date="new Date()" :dark-mode="dark" :locale="locale"
                                  :tooltip-formatter="tooltipFormatter" no-data-text="没有笔记"/>
            </div>
        </div>
        <statistics-explore/>
        <statistics-tag/>
    </div>
</template>
<script lang="ts" setup>
import {computed, onMounted, ref, toRaw, watch} from "vue";
import {CalendarHeatmap} from "vue3-calendar-heatmap";
import "vue3-calendar-heatmap/dist/style.css";
import {useAppStore} from "@/store/AppStore";
import {useNoteStore} from "@/store/NoteStore";
import {
    DayCount,
    getDaysInMonth, getMaxConsecutiveDays,
    renderAssignDayCount, renderDayCount,
    renderDayMap,
} from "@/pages/statistics/func/date";
import {toDateString} from "xe-utils";
import {CalendarItem} from "vue3-calendar-heatmap";
import StatisticsExplore from "@/pages/statistics/components/StatisticsExplore.vue";
import StatisticsTag from "@/pages/statistics/components/StatisticsTag.vue";

const now = new Date();
const year = now.getFullYear() + '';
const locale = {
    months: ["一月", "二月", "三月", "四月", "五月", "六月", "七月", "八月", "九月", "十月", "十一月", "十二月"],
    days: ['星期一', '星期二', '星期三', '星期四', '星期五', '星期六', '星期日']
};

const date = ref<string>(`${now.getFullYear()}-${now.getMonth() < 9 ? '0' : ''}${now.getMonth() + 1}`);
const max = ref(0);
const count = ref(0);
const continuous = ref(0);
const total = ref(0);
const dayCount = ref(new Array<DayCount>());

const dark = computed(() => useAppStore().dark);

let ids = new Array<number>();
let dayMap = new Map<string, number>();


onMounted(() => {
    init().then(() => every().then(() => console.log("初始化完成")))
});

watch(() => date.value, every);

async function init() {

    total.value = 0;

    await useNoteStore().init();
    ids = useNoteStore().allIds();
    dayMap = renderDayMap(ids);

    dayMap.forEach((value, key) => {
        let date = new Date(key);
        let diffTime = Math.abs(now.getTime() - date.getTime());
        let diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); // 计算日期差值

        if (diffDays <= 365) {
            total.value += value;
        }
    });

    dayCount.value = renderDayCount(dayMap);

}

async function every() {


    max.value = 0;
    count.value = 0;
    continuous.value = 0;

    const month = date.value.split("-")
    const days = getDaysInMonth(parseInt(month[0]), parseInt(month[1]));
    let dayCounts = renderAssignDayCount(days, dayMap);
    continuous.value = getMaxConsecutiveDays(dayCounts);


    for (let day of days) {
        const c = dayMap.get(day);
        if (c) {
            count.value += c;
            if (c > max.value) {
                max.value = c;
            }
        }
    }


}

function tooltipFormatter(item: CalendarItem) {
    item = toRaw(item);
    return `${toDateString(item.date, "yyyy-MM-dd")} 记了 ${item.count} 条笔记`

}
</script>
<style scoped lang="less">
.statistics {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    overflow: auto;

    & > .card-container {
        margin-top: 0;
    }
}
</style>
