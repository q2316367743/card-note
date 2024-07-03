<template>
    <a-card class="base-setting">
        <a-form :model="{}" layout="vertical">
            <a-form-item label="主题">
                <a-radio-group v-model="themeType">
                    <a-radio :value="0">跟随系统</a-radio>
                    <a-radio :value="1">白天</a-radio>
                    <a-radio :value="2">黑夜</a-radio>
                </a-radio-group>
            </a-form-item>
            <a-form-item label="笔记折叠行数">
                <a-input-number v-model="ellipseRows" :min="-1" style="width: 150px"/>
                <template #help>-1表示不折叠</template>
            </a-form-item>
            <a-form-item label="字体大小">
                <a-input-number v-model="fontSize" :min="8" style="width: 150px">
                    <template #suffix>px</template>
                </a-input-number>
            </a-form-item>
            <a-form-item label="字体">
                <a-input v-model="fontFamily" allow-clear placeholder="例如：'霞鹜文楷 GB'"/>
                <template #help>
                    <span>更多信息请参考：</span>
                    <a-link @click="openFontFamily()">font-family</a-link>
                </template>
            </a-form-item>
            <a-divider />
            <a-form-item label="完全的markdown编辑器">
                <a-switch v-model="mdEditorEnable" type="round">
                    <template #checked>启用</template>
                    <template #unchecked>禁用</template>
                </a-switch>
                <template #help>
                    完整的markdown编辑器将支持全部的markdown语法，包括数学公式，流程图、时序图等等各种图
                </template>
            </a-form-item>
            <a-form-item label="markdown编辑器高度">
                <a-input-number v-model="mdEditorHeight" :min="200" :disabled="!mdEditorEnable" style="width: 150px">
                    <template #suffix>px</template>
                </a-input-number>
            </a-form-item>
            <a-form-item label="markdown编辑器是否展示预览">
                <a-switch v-model="mdEditorPreview" type="round" :disabled="!mdEditorEnable"/>
            </a-form-item>
            <a-form-item label="markdown预览主题">
                <a-select v-model="mdEditorTheme">
                    <a-option value="default">default</a-option>
                    <a-option value="github">github</a-option>
                    <a-option value="vuepress">vuepress</a-option>
                    <a-option value="mk-cute">mk-cute</a-option>
                    <a-option value="smart-blue">smart-blue</a-option>
                    <a-option value="cyanosis">cyanosis</a-option>
                    <a-option value="arknights">arknights</a-option>
                </a-select>
                <template #help>
                    只在启用【完全的markdown编辑器】时生效
                </template>
            </a-form-item>
            <a-divider />
            <a-form-item label="开发者工具">
                <a-switch v-model="devTool" type="round"/>
            </a-form-item>
        </a-form>
    </a-card>
</template>
<script lang="ts" setup>
import {ref, watch} from "vue";
import {
    useAppStore,
    devTool,
    ellipseRows,
    fontSize,
    fontFamily,
    mdEditorEnable,
    mdEditorHeight, mdEditorPreview, mdEditorTheme
} from "@/store/AppStore";

const themeType = ref(useAppStore().themeType);

watch(() => themeType.value, value => useAppStore().saveThemeType(value));

function openFontFamily() {
    utools.shellOpenExternal("https://developer.mozilla.org/zh-CN/docs/web/css/font-family")
}

</script>
<style scoped>
.base-setting {
}
</style>
