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
                <a-upload title="从知识库中导入" :custom-request="importFromKb" :show-file-list="false">
                    <template #upload-button>
                        <a-button type="primary">
                            从知识库中导入
                        </a-button>
                    </template>
                </a-upload>
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
                <a-upload title="从卡片笔记中导入" :custom-request="importFromCardNote" :show-file-list="false">
                    <template #upload-button>
                        <a-button type="primary">
                            从卡片笔记中导入
                        </a-button>
                    </template>
                </a-upload>
                <a-button type="primary" @click="openExportForCardNote()">导出为卡片笔记</a-button>
            </a-space>
        </a-button-group>
        <a-alert style="margin-top: 7px;">
            <template #icon>
                <icon-more/>
            </template>
            更多
        </a-alert>
        <a-button-group style="margin-top: 7px;">
            <a-space>
                <a-tooltip content="如果出现导入数据重复的问题，请先删除重复数据，再清除缓存，之后再重新导入即可">
                    <a-button type="primary" @click="openClearCache()">清理缓存</a-button>
                </a-tooltip>
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
import {openImportFromKb} from "@/components/ImportOrExport/ImportFromKb";
import {openClearCache} from "@/components/ImportOrExport/ClearCache";

const isWeb = Constant.platform === 'web';

function importFromCardNote(option: RequestOption) {
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

function importFromKb(option: RequestOption) {
    const file = option.fileItem.file;
    if (file) {
        openImportFromKb(file);
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
