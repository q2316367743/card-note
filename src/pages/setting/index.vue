<template>
    <div class="setting">
        <a-tabs hide-content v-model:active-key="activeKey">
            <a-tab-pane title="基础设置" key="1"/>
            <a-tab-pane title="同步设置" key="2"/>
        </a-tabs>
        <div class="container">
            <base-setting v-if="activeKey === '1'"/>
            <sync-setting v-else-if="activeKey === '2'"/>
        </div>
    </div>
</template>
<script lang="ts" setup>
import {ref} from "vue";
import BaseSetting from "@/pages/setting/module/BaseSetting.vue";
import SyncSetting from "@/pages/setting/module/SyncSetting.vue";

const activeKey = ref('1');
</script>
<style scoped lang="less">
.setting {
    position: relative;
    height: 100%;
    width: 100%;

    .container {
        position: absolute;
        top: 46px;
        left: 7px;
        right: 7px;
        bottom: 7px;
    }
}
</style>
