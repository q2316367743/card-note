<template>
    <div class="card">
        <div class="label">全部标签</div>
        <div class="content">
            <a-tree block-node default-expand-all :data="nodes" :virtual-list-props="{height: 250}"/>
        </div>
    </div>
</template>
<script lang="ts" setup>
import {computed} from "vue";
import {useTagStore} from "@/store/TagStore";
import {renderTagTree} from "@/pages/statistics/func/date";
import {useAppStore} from "@/store/AppStore";

const nodes = computed(() => renderTagTree(Array.from(useTagStore().tags), useAppStore().tagSplitChar));
</script>
<style scoped>

</style>
