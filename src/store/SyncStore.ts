import {defineStore} from "pinia";
import {ref} from "vue";
import {getDefaultSyncSetting} from "@/entity/SyncSetting";
import {getFromOneByDefault} from "@/utils/utools/DbStorageUtil";
import DbKeyEnum from "@/enumeration/DbKeyEnum";

export const useSyncStore = defineStore('sync', () => {
    const syncSetting = ref(getDefaultSyncSetting());
    let rev: string | undefined = undefined;

    async function init() {
        const res = await getFromOneByDefault(DbKeyEnum.SETTING_SYNC, syncSetting.value);
        syncSetting.value = res.record;
        rev = res.rev;
    }

    return {syncSetting, init}

})
