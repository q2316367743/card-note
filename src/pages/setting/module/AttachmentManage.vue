<template>
    <div class="attachment-manage">
        <a-list :bordered="false">
            <a-list-item v-for="key in keys" :key="key" :span="24">
                <a-link>{{ key }}</a-link>
                <template #actions>
                    <a-button-group type="text">
                        <a-tooltip content="拷贝">
                            <a-button @click="onCopy(key)">
                                <template #icon>
                                    <icon-copy/>
                                </template>
                            </a-button>
                        </a-tooltip>
                        <a-tooltip content="预览">
                            <a-button :loading="previewLoading" @click="openPreview(key)">
                                <template #icon>
                                    <icon-eye/>
                                </template>
                            </a-button>
                        </a-tooltip>
                        <a-popconfirm content="确认删除此附件，如果文章引用了附件，则无法显示" ok-text="删除" @ok="onRemove(key)">
                            <a-button status="danger">
                                <template #icon>
                                    <icon-delete/>
                                </template>
                            </a-button>
                        </a-popconfirm>
                    </a-button-group>
                </template>
            </a-list-item>
        </a-list>
        <a-image-preview v-model:visible="preview.visible" :src="preview.src"/>
    </div>
</template>
<script lang="ts" setup>
import {ref} from "vue";
import {listRecordByAsync} from "@/utils/utools/DbStorageUtil";
import {ATTACHMENT_PREFIX} from "@/entity/Role";
import Constant from "@/global/Constant";
import {copy} from "@/utils/lang/BrowserUtil";
import MessageUtil from "@/utils/modal/MessageUtil";
import {transformImgUrl} from "@/plugin/image";

const keys = ref<Array<string>>([]);
const previewLoading = ref(false);
const preview = ref({
    visible: false,
    src: '',
});

listRecordByAsync(ATTACHMENT_PREFIX).then(value => keys.value = value.map(e => `utools://${Constant.id}${e.id}`));

function onCopy(show: string) {
    copy(`![](${show})`, false);
    MessageUtil.success("已成功复制到剪切板，可以在编辑器中粘贴使用");
}

function openPreview(id: string) {
    previewLoading.value = true;
    transformImgUrl(id)
        .then(url => {
            preview.value = {
                visible: true,
                src: url
            };
        })
        .catch(e => MessageUtil.error("获取图片内容失败", e))
        .finally(() => previewLoading.value = false);
}

function onRemove(url: string) {
    // TODO:b 删除附件
}
</script>
<style scoped>
.attachment-manage {
    background-color: var(--color-bg-1);
}
</style>
