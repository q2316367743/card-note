<template>
    <div>
        <a-alert type="warning" style="margin-bottom: 7px;">增加装修中...</a-alert>
        <a-alert>
            <template #icon>
                <icon-import/>
            </template>
            导入
        </a-alert>
        <a-button-group style="margin-top: 7px;">
            <a-space>
                <a-button type="primary" @click="openImportFromMemos()" :disabled="!isUtools">
                    从Memos中导入
                </a-button>
            </a-space>
        </a-button-group>
        <a-alert style="margin-top: 7px;">
            <template #icon>
                <icon-export/>
            </template>
            导出
        </a-alert>
        <a-button-group style="margin-top: 7px;">
            <a-space>
                <a-button type="primary" disabled>
                    导出为Markdown
                </a-button>
            </a-space>
        </a-button-group>
    </div>
</template>
<script lang="ts" setup>
import {openImportFromMemos} from "@/components/ImportOrExport/ImportFromMemos";
const isUtools = window.isUtools;
console.log(isUtools)
</script>
<style scoped>

</style>
