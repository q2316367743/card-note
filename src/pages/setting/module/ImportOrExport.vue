<template>
    <a-card>
        <a-alert>
            <template #icon>
                <icon-import/>
            </template>
            导入
        </a-alert>
        <a-button-group style="margin-top: 7px;">
            <a-space>
                <a-button type="primary" @click="openImportFromMemos()" :disabled="isWeb">
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
                <a-button type="primary" @click="exportAllForMd()">
                    导出全部为Markdown文件
                </a-button>
                <a-button type="primary" @click="openExportToZip()">
                    导出全部为zip文件
                </a-button>
            </a-space>
        </a-button-group>
        <a-alert style="margin-top: 7px;">
            <template #icon>
                <icon-export/>
            </template>
            备份
        </a-alert>
        <a-button-group style="margin-top: 7px;">
            <a-space>
                <a-upload title="从卡片笔记中导入" :custom-request="customRequest" :show-file-list="false">
                    <template #upload-button>
                        <a-button type="primary">
                            从卡片笔记中导入
                        </a-button>
                    </template>
                </a-upload>
                <a-button type="primary" @click="openExportForCardNote()">导出为卡片笔记</a-button>
            </a-space>
        </a-button-group>
    </a-card>
</template>
<script lang="ts" setup>
import {openImportFromMemos} from "@/components/ImportOrExport/ImportFromMemos";
import {openExportForCardNote} from "@/components/ImportOrExport/ExportForCardNote";
import {openImportFromCardNote} from "@/components/ImportOrExport/ImportFromCardNote";
import Constant from "@/global/Constant";
import {RequestOption} from "@arco-design/web-vue";
import {useNoteStore} from "@/store/NoteStore";
import {exportOneMarkdown} from "@/components/ImportOrExport/ExportOneMarkdown";
import {openExportToZip} from "@/components/ImportOrExport/ExportToZip";

const isWeb = Constant.platform === 'web';

function customRequest(option: RequestOption) {
    const file = option.fileItem.file;
    if (file) {
        openImportFromCardNote(file);
    }
    return {
        abort() {
            console.log("取消上传")
        }
    }
}

function exportAllForMd() {
    useNoteStore().getMany(useNoteStore().allIds()).then(exportOneMarkdown);
}
</script>
<style scoped>

</style>
