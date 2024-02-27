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
            <a-list-item v-for="(placeholder, index) in placeholders" :key="placeholder.label">
                <a-list-item-meta :title="placeholder.label" :description="placeholder.prefix"/>
                <template #actions>
                    <a-button-group type="text" :disabled="index === 0">
                        <a-button @click="placeholderEdit(placeholder, index)">
                            <template #icon>
                                <icon-edit/>
                            </template>
                        </a-button>
                        <a-popconfirm @ok="placeholderRemove(index)" ok-text="删除" content="是否删除此功能"
                                      :ok-button-props="{status:'danger'}">
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
    </a-card>
</template>
<script lang="tsx" setup>
import {computed, Ref, ref} from "vue";
import {clone} from "xe-utils";
import {AiPlaceholder, AiTypeEnum, getDefaultAiPlaceholder} from "@/entity/AiSetting";
import MessageUtil from "@/utils/MessageUtil";
import {useAiStore} from "@/store/AiStore";
import {Modal, Form, FormItem, Input} from "@arco-design/web-vue";

const aiSetting = ref(clone(useAiStore().aiSetting, true));

const placeholders = computed(() => useAiStore().placeholders);

function save(msg: boolean = true) {
    useAiStore().save(aiSetting.value)
        .then(() => msg && MessageUtil.success("保存成功"))
        .catch(e => MessageUtil.error("保存失败", e));
}

const openXunFei = () => utools.shellOpenExternal("https://xinghuo.xfyun.cn/sparkapi");

function buildForm(placeholder: Ref<AiPlaceholder>) {
    return () => <Form model={placeholder.value} layout={`vertical`}>
        <FormItem label="标签">
            <Input v-model={placeholder.value.label}/>
        </FormItem>
        <FormItem label="前缀">
            <Input v-model={placeholder.value.prefix}/>
        </FormItem>
    </Form>;
}

function placeholderAdd() {
    const placeholder = ref(getDefaultAiPlaceholder());
    Modal.open({
        title: "新增占位符",
        okText: '新增',
        content: buildForm(placeholder),
        onBeforeOk: async () => {
            try {
                await useAiStore().addPlaceholder(placeholder.value);
                MessageUtil.success("新增成功");
                return true;
            } catch (e) {
                MessageUtil.error("新增失败", e);
                return false;
            }
        }
    })
}

function placeholderEdit(res: AiPlaceholder, index: number) {
    const placeholder = ref(clone(res, true));
    Modal.open({
        title: "修改占位符",
        okText: '修改',
        content: buildForm(placeholder),
        onBeforeOk: async () => {
            try {
                await useAiStore().updatePlaceholder(index, placeholder.value);
                MessageUtil.success("修改成功");
                return true;
            } catch (e) {
                MessageUtil.error("修改失败", e);
                return false;
            }
        }
    })
}

function placeholderRemove(index: number) {
    useAiStore().removePlaceholder(index)
        .then(() => MessageUtil.success("删除成功"))
        .catch(e => MessageUtil.error("删除失败", e));
}

</script>
<style scoped>

</style>
