import {defineStore} from "pinia";
import {computed, ref, shallowRef, watch} from "vue";
import {getDefaultSyncSetting, SyncSetting} from "@/entity/SyncSetting";
import {getFromOneByDefault, saveOneByAsync} from "@/utils/utools/DbStorageUtil";
import DbKeyEnum from "@/enumeration/DbKeyEnum";
import {useDocumentVisibility, useEventBus, useIntervalFn} from "@vueuse/core";
import {createClient, WebDAVClient} from 'webdav'
import {handleAutoSync, SyncState} from "@/components/SyncAlgorithm/AutoSync";
import {useIdleSync} from "@/components/SyncAlgorithm/IdleSync";


export const useSyncEvent = useEventBus<SyncState>('sync');

// 注册一个事件
useSyncEvent.reset();
useSyncEvent.on(handleAutoSync);



export const useSyncStore = defineStore('sync', () => {
    const syncSetting = ref(getDefaultSyncSetting());
    let rev: string | undefined = undefined;
    let client = shallowRef<WebDAVClient | null>(null);

    const disableAutoSync = computed(() => client.value == null || !syncSetting.value.autoSync);
    const disableIdleSync = computed(() => client.value == null || !syncSetting.value.idleSync);
    const idleSyncInterval = computed(() => syncSetting.value.idleSyncInterval);

    const intervalFn = useIntervalFn(useIdleSync, idleSyncInterval);

    const visibility = useDocumentVisibility();
    watch(() => visibility.value, value => {
        if (value === 'hidden') {
            intervalFn.resume();
        }else if (value === 'visible') {
            intervalFn.pause();
        }
    }, {immediate: true})

    async function init() {
        const res = await getFromOneByDefault(DbKeyEnum.SETTING_SYNC, syncSetting.value);
        syncSetting.value = res.record;
        rev = res.rev;
        buildClient();
    }

    async function save(res: SyncSetting) {
        syncSetting.value = res;
        rev = await saveOneByAsync(DbKeyEnum.SETTING_SYNC, syncSetting.value, rev);
        buildClient();
    }

    function buildClient() {
        client.value = null;
        if (syncSetting.value.url !== '') {
            client.value = createClient(syncSetting.value.url, {
                username: syncSetting.value.username,
                password: syncSetting.value.password
            });
        }
    }

    return {syncSetting, disableAutoSync, disableIdleSync, client, intervalFn, init, save}

})
