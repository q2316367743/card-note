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
            <a-form-item label="token">
                <a-input-password allow-clear v-model="aiSetting.token"/>
            </a-form-item>
            <a-form-item label="模型">
                <a-input-group>
                    <a-select v-model="aiSetting.model" style="width: 250px;" allow-clear allow-search
                              :loading="loading">
                        <a-option v-for="model in models" :value="model">{{ model }}</a-option>
                    </a-select>
                    <a-button type="text" :disabled="aiSetting.url === '' || aiSetting.token === ''"
                              @click="getAllModules()" :loading="loading">获取全部模型
                    </a-button>
                </a-input-group>
            </a-form-item>
        </a-form>
    </a-card>
</template>
<script lang="ts" setup>
import {ref} from "vue";
import {clone} from "xe-utils";
import MessageUtil from "@/utils/modal/MessageUtil";
import {useAiStore} from "@/store/AiStore";
import {getItemByDefault, setItem} from "@/utils/utools/DbStorageUtil";
import DbKeyEnum from "@/enumeration/DbKeyEnum";

const aiSetting = ref(clone(useAiStore().aiSetting, true));

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


</script>
<style scoped>

</style>
