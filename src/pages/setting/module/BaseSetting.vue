<template>
    <div class="base-setting">
        <a-form :model="{}" layout="vertical">
            <a-form-item label="主题">
                <a-select v-model="themeType" style="width: 200px;">
                    <a-option :value="0">跟随系统</a-option>
                    <a-option :value="1">白天</a-option>
                    <a-option :value="2">黑夜</a-option>
                </a-select>
            </a-form-item>
            <a-form-item label="笔记省略行数"></a-form-item>
        </a-form>
    </div>
</template>
<script lang="ts" setup>
import {ref, watch} from "vue";
import {useAppStore} from "@/store/AppStore";

const themeType = ref(useAppStore().getThemeType());

watch(() => themeType.value, value => useAppStore().saveThemeType(value));

</script>
<style scoped>
.base-setting {
    padding: 7px;
}
</style>
