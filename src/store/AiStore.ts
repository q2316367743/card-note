import {defineStore} from "pinia";
import {ref} from "vue";
import {AiSetting, getDefaultAiSetting} from "@/entity/AiSetting";
import {getFromOneByAsync, saveOneByAsync} from "@/utils/utools/DbStorageUtil";
import DbKeyEnum from "@/enumeration/DbKeyEnum";

export const useAiStore = defineStore("ai", () => {
    const aiSetting = ref(getDefaultAiSetting());
    let rev: string | undefined = undefined;

    async function init() {
        const res = await getFromOneByAsync<AiSetting>(DbKeyEnum.SETTING_AI);
        if (res) {
            aiSetting.value = res.record;
            rev = res.rev;
        }
    }

    async function save(res: AiSetting) {
        aiSetting.value = res;
        rev = await saveOneByAsync(DbKeyEnum.SETTING_AI, aiSetting.value, rev);
    }

    return {aiSetting, init, save};

});
