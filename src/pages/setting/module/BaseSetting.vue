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
            <a-form-item label="开发者工具">
                <a-switch v-model="devTool"/>
            </a-form-item>
        </a-form>
    </a-card>
</template>
<script lang="ts" setup>
import {ref, watch} from "vue";
import {useAppStore, devTool, ellipseRows} from "@/store/AppStore";

const themeType = ref(useAppStore().themeType);

watch(() => themeType.value, value => useAppStore().saveThemeType(value));

</script>
<style scoped>
.base-setting {
}
</style>
