<template>
    <div class="statistics">
        <div class="card">
            <div class="label">记录统计</div>
            <div class="content">
                <a-row>
                    <a-col :span="8" style="text-align: center">
                        <a-statistic extra="MEMO" :value="count"/>
                    </a-col>
                    <a-col :span="8" style="text-align: center">
                        <a-statistic extra="单日最多条数" :value="max"/>
                    </a-col>
                    <a-col :span="8" style="text-align: center">
                        <a-statistic extra="坚持记录天数" :value="2"/>
                    </a-col>
                </a-row>
                <div ref="histogram" style="margin-top: 16px;"></div>
            </div>
        </div>
        <div class="card">
            <div class="label">最近一年记录 517 条 MEMO</div>
            <div class="content">
            </div>
        </div>
    </div>
</template>
<script lang="ts" setup>
import {computed, onMounted, ref, shallowRef, watch} from "vue";
import {VChart} from "@visactor/vchart";
import {useAppStore} from "@/store/AppStore";
import {useNoteStore} from "@/store/NoteStore";
import {
    renderDayMap,
    renderISpec
} from "@/pages/statistics/func/date";

const histogram = ref<HTMLElement | null>(null);
const vChart = shallowRef<VChart>();
const max = ref(0);

const dark = computed(() => useAppStore().dark);
const count = computed(() => useNoteStore().allIds().length);

onMounted(() => {
    if (!histogram.value) {
        return;
    }
    const ids  = useNoteStore().allIds();
    let map = renderDayMap(ids);
    map.forEach(v => max.value = Math.max(max.value, v));
    vChart.value = new VChart(renderISpec(ids), {dom: histogram.value});
    vChart.value.renderSync();

});
watch(() => useNoteStore().allIds(), value => {
    let map = renderDayMap(value);
    map.forEach(v => max.value = Math.max(max.value, v));
    vChart.value && vChart.value.updateSpec(renderISpec(value));

}, {
    deep: true,
});


</script>
<style scoped>
.statistics {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    overflow: auto;
}
</style>
