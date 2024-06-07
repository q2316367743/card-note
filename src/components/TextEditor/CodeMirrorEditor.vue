<template>
    <div class="code-mirror-editor" :style="{fontFamily: fontFamilyWrap, fontSize: fontSizeWrap}">
        <vue-codemirror v-model:value="modelValue" :options="options" >
        </vue-codemirror>
    </div>
</template>
<script lang="ts" setup>
import {fontFamilyWrap, fontSizeWrap} from "@/store/AppStore";
import {EditorConfiguration} from "codemirror";
import VueCodemirror from "codemirror-editor-vue3";
import "codemirror/mode/markdown/markdown.js";
import '@/assets/less/codemirror.less';


const modelValue = defineModel({
    type: String,
    default: ''
});

const options: EditorConfiguration = {
    mode: "text/markdown",
    lineNumbers: true,
    lineWrapping: true,
    theme: 'eclipse'
}

const addCheckbox = () => {
};
const addTable = () => {
};
const addCode = () => {
};

defineExpose({addCheckbox, addTable, addCode});
</script>
<style>
.code-mirror-editor {
    overflow: auto;
    max-height: 12rem;
    position: relative;
    width: 100%;
    height: 100%;
    display: block;
}

.ͼ1 .cm-scroller {
    font-size: v-bind(fontSizeWrap) !important;
    font-family: v-bind(fontFamilyWrap) !important;
}
</style>
