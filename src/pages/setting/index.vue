<template>
    <div class="setting card-container">
        <a-tabs hide-content v-model:active-key="activeKey">
            <a-tab-pane title="基础设置" key="1"/>
<!--            <a-tab-pane title="角色管理" key="2" disabled/>-->
            <a-tab-pane title="同步设置" key="3" :disabled="!isUtools"/>
            <a-tab-pane title="AI设置" key="4"/>
            <a-tab-pane title="导入与导出" key="5"/>
            <a-tab-pane title="附件管理" key="6"/>
        </a-tabs>
        <div class="container">
            <base-setting v-if="activeKey === '1'"/>
            <role-setting v-else-if="activeKey === '2'"/>
            <sync-setting v-else-if="activeKey === '3'"/>
            <ai-setting v-else-if="activeKey === '4'" />
            <import-or-export v-else-if="activeKey === '5'" />
            <attachment-manage v-else-if="activeKey === '6'" />
        </div>
    </div>
</template>
<script lang="ts" setup>
import {ref} from "vue";
import BaseSetting from "@/pages/setting/module/BaseSetting.vue";
import SyncSetting from "@/pages/setting/module/SyncSetting.vue";
import ImportOrExport from "@/pages/setting/module/ImportOrExport.vue";
import AiSetting from "@/pages/setting/module/AiSetting.vue";
import RoleSetting from "@/pages/setting/module/RoleSetting/index.vue";
import AttachmentManage from "@/pages/setting/module/AttachmentManage.vue";
import {isUtools} from "@/plugin/utools";

const activeKey = ref('1');
</script>
<style scoped lang="less">
.setting {
    position: relative;
    height: 100%;
    width: 100%;

    &.card-container {
        margin-top: 0;
    }

    .container {
        position: absolute;
        top: 46px;
        left: 7px;
        right: 7px;
        bottom: 7px;
        overflow: auto;
    }
}
</style>
