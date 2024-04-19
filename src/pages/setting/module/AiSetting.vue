<template>
    <a-card title="基础设置">
        <template #extra>
            <a-button type="primary" @click="save()">保存</a-button>
        </template>
        <a-alert style="margin-bottom: 4px;">
            <span>推荐使用</span>
            <a-link @click="toApi()">V3 API</a-link>
            <span>，无需科学上网，即可使用。</span>
        </a-alert>
        <a-form :model="aiSetting" layout="vertical">
            <a-form-item label="链接">
                <a-input allow-clear v-model="aiSetting.url" placeholder="https://api.openai.com"/>
                <template #help>
                    openai或兼容openai api的地址
                </template>
            </a-form-item>
            <a-form-item label="token" >
                <a-input-password allow-clear v-model="aiSetting.token"/>
            </a-form-item>
            <a-form-item label="模型">
                <a-input-group>
                    <a-select v-model="aiSetting.model" style="width: 250px;" allow-clear allow-search :loading="loading">
                        <a-option v-for="model in models" :value="model">{{ model }}</a-option>
                    </a-select>
                    <a-button type="text" :disabled="aiSetting.url === '' || aiSetting.token === ''"
                              @click="getAllModules()" :loading="loading">获取全部模型
                    </a-button>
                </a-input-group>
            </a-form-item>
        </a-form>
    </a-card>
    <a-card title="功能设置" style="margin-top: 7px;" v-if="!disabled">
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
import {AiPlaceholder, getDefaultAiPlaceholder} from "@/entity/AiSetting";
import MessageUtil from "@/utils/MessageUtil";
import {useAiStore} from "@/store/AiStore";
import {Modal, Form, FormItem, Input} from "@arco-design/web-vue";
import {getItemByDefault, setItem} from "@/utils/utools/DbStorageUtil";
import DbKeyEnum from "@/enumeration/DbKeyEnum";

const aiSetting = ref(clone(useAiStore().aiSetting, true));

const placeholders = computed(() => useAiStore().placeholders);
const disabled = computed(() => useAiStore().disabled);
const models = ref(getItemByDefault(DbKeyEnum.KEY_CHAT_MODELS, [
    "gpt-3.5-turbo", "gpt-3.5-turbo-0125", "gpt-3.5-turbo-1106", "gpt-3.5-turbo-0613",
    "gpt-3.5-turbo-16k", "gpt-3.5-turbo-16k-0613", "gpt-4-turbo-preview", "gpt-4-0125-preview",
    "gpt-4-1106-preview", "gpt-4-vision-preview", "gpt-4", "gpt-4-0613", "gpt-4-32k"]));
const loading = ref(false);


function save(msg: boolean = true) {
    useAiStore().save(aiSetting.value)
        .then(() => msg && MessageUtil.success("保存成功"))
        .catch(e => MessageUtil.error("保存失败", e));
}

const toApi = () => utools.shellOpenExternal("https://api.v3.cm/register?aff=6A4f");


function getAllModules() {
    useAiStore().save(aiSetting.value).then(async () => {
        const {openAi} = useAiStore();
        if (openAi) {
            loading.value = true;
            try {
                const res = await openAi.models.list();
                const items = new Array<string>();
                items.push(...res.data.map(e => e.id));
                while (res.hasNextPage()) {
                    await res.getNextPage();
                    items.push(...res.data.map(e => e.id));
                }
                models.value = items;
                setItem(DbKeyEnum.KEY_CHAT_MODELS, models.value);
                MessageUtil.success("获取成功");
            } catch (e) {
                MessageUtil.error("获取失败", e);
            } finally {
                loading.value = false;
            }
        }
    })
}

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
