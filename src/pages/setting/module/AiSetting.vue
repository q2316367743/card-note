<template>
    <a-card title="基础设置">
        <template #extra>
            <a-button type="primary" @click="save()">保存</a-button>
        </template>
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
        </a-form>
    </a-card>
    <a-card title="功能设置" style="margin-top: 7px;">
        <template #extra>
            <a-button type="text" @click="placeholderAdd()">
                <template #icon>
                    <icon-plus/>
                </template>
            </a-button>
        </template>
        <a-list :bordered="false">
            <a-list-item v-for="placeholder in aiSetting.placeholders" :key="placeholder.label">>
                <a-list-item-meta :title="placeholder.label" :description="placeholder.prefix"/>
                <template #actions>
                    <a-button-group type="text">
                        <a-button>
                            <template #icon>
                                <icon-edit/>
                            </template>
                        </a-button>
                        <a-button status="danger">
                            <template #icon>
                                <icon-delete/>
                            </template>
                        </a-button>
                    </a-button-group>
                </template>
            </a-list-item>
        </a-list>
    </a-card>
</template>
<script lang="tsx" setup>
import {ref} from "vue";
import {clone} from "xe-utils";
import {AiTypeEnum, getDefaultAiPlaceholder} from "@/entity/AiSetting";
import MessageUtil from "@/utils/MessageUtil";
import {useAiStore} from "@/store/AiStore";
import {Modal, Form, FormItem, Input} from "@arco-design/web-vue";

const aiSetting = ref(clone(useAiStore().aiSetting, true));

function save(msg: boolean = true) {
    useAiStore().save(aiSetting.value)
        .then(() => msg && MessageUtil.success("保存成功"))
        .catch(e => MessageUtil.error("保存失败", e));
}

const openXunFei = () => utools.shellOpenExternal("https://xinghuo.xfyun.cn/sparkapi");

function placeholderAdd() {
    const placeholder = ref(getDefaultAiPlaceholder());
    Modal.open({
        title: "新增占位符",
        okText: '新增',
        content: () => <Form model={placeholder.value} layout={`vertical`}>
            <FormItem label="标签">
                <Input v-model={placeholder.value.label}/>
            </FormItem>
            <FormItem label="前缀">
                <Input v-model={placeholder.value.prefix}/>
            </FormItem>
        </Form>
    })
}

</script>
<style scoped>

</style>
