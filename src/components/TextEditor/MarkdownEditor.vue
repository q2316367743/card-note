<template>
    <div class="markdown-editor">
        <md-editor v-model="modelValue" :code-theme="codeTheme" placeholder="任何想法。。。"
                   :preview="mdEditorPreview" :theme :preview-theme="mdEditorTheme" :style
                   :footers="['markdownTotal']" :auto-detect-code="true"
                   @save="onSave" @error="onError" @upload-img="onImageUpload"
        />
    </div>
</template>
<script lang="ts" setup>
import {computed} from "vue";
import {MdEditor} from "md-editor-v3";
import 'md-editor-v3/lib/style.css';
import {
    fontFamilyWrap,
    fontSizeWrap,
    mdEditorHeight,
    mdEditorPreview,
    mdEditorTheme,
    useAppStore
} from "@/store/AppStore";
import {useImageUpload} from "@/plugin/image";
import MessageUtil from "@/utils/modal/MessageUtil";

const modelValue = defineModel({
    type: String,
    default: ''
});
const emits = defineEmits(['save']);

const theme = computed(() => useAppStore().theme);
const height = computed(() => {
    const res = mdEditorHeight.value
    if (Number.isInteger(res)) {
        return Math.max(res, 200) + 'px';
    }
    return '200px';
});
const style = computed(() => ({
    height: '100%', fontFamily: fontFamilyWrap.value, fontSize: fontSizeWrap.value
}));
const codeTheme = computed(() => useAppStore().dark ? 'github-dark' : 'github');

function onSave(v: string) {
    emits('save', v);
}

function onError(err: { name: 'Cropper' | 'fullscreen' | 'prettier' | 'overlength'; message: string }) {
    MessageUtil.error(`【${err.name}】出现异常`, err.message);
}

function onImageUpload(files: Array<File>, callback: (urls: string[] | {
    url: string;
    alt: string;
    title: string
}[]) => void) {
    Promise.all(files.map(e => useImageUpload(e)))
        .then(callback)
        .catch(e => MessageUtil.error("图片上传失败", e));
}

const addCheckbox = () => {
};
const addTable = () => {
};
const addCode = () => {
};
defineExpose({addCheckbox, addTable, addCode});
</script>
<style lang="less">
.markdown-editor {
    .md-editor-input-wrapper {
        max-height: v-bind(height);
    }
}
</style>
