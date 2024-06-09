<template>
    <a-card class="sync-setting">
        <a-form :model="syncSetting" layout="vertical">
            <a-alert>
                同步仅支持webdav，如果自己没有服务器，可以使用
                <a-link @click="openJianGuoYun()">坚果云</a-link>
                进行同步
            </a-alert>
            <a-form-item label="链接">
                <a-input allow-clear v-model="syncSetting.url" placeholder="请输入webdav地址"/>
            </a-form-item>
            <a-form-item label="用户名">
                <a-input allow-clear v-model="syncSetting.username"/>
            </a-form-item>
            <a-form-item label="密码">
                <a-input-password allow-clear v-model="syncSetting.password"/>
            </a-form-item>
            <a-form-item label="是否开启自动同步">
                <a-switch v-model="syncSetting.autoSync"/>
                <template #help>自动同步还不稳定，开启后，如果本地数据与远程数据不一致，可能出现数据丢失的问题，请谨慎开启</template>
            </a-form-item>
            <a-form-item label="是否开启空闲全量同步">
                <a-switch v-model="syncSetting.idleSync"/>
                <template #help>当插件隐藏【空闲时间】之后，会进行一次全量同步。</template>
            </a-form-item>
            <a-form-item label="空闲时间">
                <a-input-number v-model="syncSetting.idleSyncInterval" :min="0" :max="60 * 60 * 1000" :step="1000">
                    <template #suffix>毫秒</template>
                </a-input-number>
                <template #help>
                    1秒 = 1000毫秒
                </template>
            </a-form-item>
            <a-form-item>
                <a-space>
                    <a-button type="primary" @click="save()">保存</a-button>
                    <a-button type="text" @click="fullSync()" :disabled="syncSetting.url.trim() === ''">
                        立即同步
                    </a-button>
                </a-space>
            </a-form-item>
        </a-form>
    </a-card>
</template>
<script lang="ts" setup>
import {ref} from "vue";
import {useSyncStore} from "@/store/SyncStore";
import {clone} from "xe-utils";
import MessageUtil from "@/utils/modal/MessageUtil";
import {fullSynchronization} from "@/components/SyncAlgorithm/IdleSync";
import MessageBoxUtil from "@/utils/modal/MessageBoxUtil";

const syncSetting = ref(clone(useSyncStore().syncSetting, true));

function save() {
    useSyncStore().save(syncSetting.value)
        .then(() => MessageUtil.success("保存成功"))
        .catch(e => MessageUtil.error("保存失败", e));
}

function fullSync() {
    useSyncStore().save(syncSetting.value)
        .then(() => {
            let client = useSyncStore().client;
            if (!client) {
                MessageUtil.error("未连接到服务器");
                return;
            }
            let loading = MessageBoxUtil.loading("全量同步中...", "全量同步");
            fullSynchronization(client, loading)
                .then(() => MessageUtil.success("全量同步完成"))
                .catch(e => MessageUtil.error("全量同步失败", e))
                .finally(() => loading.close())
        })
}

function openJianGuoYun() {
    utools.shellOpenExternal("https://www.jianguoyun.com");
}

</script>
<style scoped>
.sync-setting {
}
</style>
