<template>
    <div class="markdown-editor">
        <md-editor v-model="modelValue" :preview="false" :theme preview-theme="vuepress"
                   code-theme="github"
                   :style="{maxHeight: '400px', height: '200px', fontFamily: fontFamilyWrap, fontSize: fontSizeWrap}"
                   @save="onSave" @error="onError"
        />
    </div>
</template>
<script lang="ts" setup>
import {MdEditor} from "md-editor-v3";
import 'md-editor-v3/lib/style.css';
import 'md-editor-v3/lib/preview.css';
import {fontFamilyWrap, fontSizeWrap, useAppStore} from "@/store/AppStore";
import {computed} from "vue";
import {Message} from "@arco-design/web-vue";

const modelValue = defineModel({
    type: String,
    default: ''
});
const emits = defineEmits(['save']);

const theme = computed(() => useAppStore().theme);

function onSave(v: string) {
    emits('save', v);
}

function onError(err: { name: 'Cropper' | 'fullscreen' | 'prettier' | 'overlength'; message: string }) {
    Message.error(err.message);
}

const addCheckbox = () => {
};
const addTable = () => {
};
const addCode = () => {
};
defineExpose({addCheckbox, addTable, addCode});
</script>
<style scoped>

</style>
