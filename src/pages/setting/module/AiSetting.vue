<template>
    <a-form :model="aiSetting" layout="vertical">
        <a-form-item label="AI类型">
            <a-radio-group v-model="aiSetting.type" placeholder="请选择AI类型">
                <a-radio :value="AiTypeEnum.NONE">无</a-radio>
                <a-radio :value="AiTypeEnum.XUN_FEI">讯飞</a-radio>
            </a-radio-group>
            <template #help>
                <span v-if="aiSetting.type === AiTypeEnum.XUN_FEI">
                    官网：
                    <a-link @click="openXunFei()">
                    讯飞星火认知大模型
                </a-link>
                </span>
            </template>
        </a-form-item>
        <a-form-item label="APPID" v-if="aiSetting.type === AiTypeEnum.XUN_FEI">
            <a-input allow-clear v-model="aiSetting.appId"/>
        </a-form-item>
        <a-form-item label="APISecret" v-if="aiSetting.type === AiTypeEnum.XUN_FEI">
            <a-input allow-clear v-model="aiSetting.apiSecret"/>
        </a-form-item>
        <a-form-item label="APIKey" v-if="aiSetting.type === AiTypeEnum.XUN_FEI">
            <a-input allow-clear v-model="aiSetting.apiKey"/>
        </a-form-item>
        <a-form-item>
            <a-button type="primary" @click="save()">保存</a-button>
        </a-form-item>
    </a-form>
</template>
<script lang="ts" setup>
import {ref} from "vue";
import {clone} from "xe-utils";
import {AiTypeEnum} from "@/entity/AiSetting";
import MessageUtil from "@/utils/MessageUtil";
import {useAiStore} from "@/store/AiStore";

const aiSetting = ref(clone(useAiStore().aiSetting, true));

function save() {
    useAiStore().save(aiSetting.value)
        .then(() => MessageUtil.success("保存成功"))
        .catch(e => MessageUtil.error("保存失败", e));
}

const openXunFei = () => utools.shellOpenExternal("https://xinghuo.xfyun.cn/sparkapi");

</script>
<style scoped>

</style>
