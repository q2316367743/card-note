import {defineStore} from "pinia";
import {computed, ref} from "vue";
import {AiSetting, AiTypeEnum, getDefaultAiSetting} from "@/entity/AiSetting";
import {getFromOneByAsync, saveOneByAsync} from "@/utils/utools/DbStorageUtil";
import DbKeyEnum from "@/enumeration/DbKeyEnum";
import {helpMePolishIt} from "@/components/AiService";
import {useRefreshNoteEvent} from "@/store/NoteStore";
import MessageUtil from "@/utils/MessageUtil";

const HELP_ME_POLISH_IT: string = "帮我润色："

export const useAiStore = defineStore("ai", () => {
    const aiSetting = ref(getDefaultAiSetting());
    let rev: string | undefined = undefined;

    const disabled = computed(() => aiSetting.value.type === AiTypeEnum.NONE ||
        aiSetting.value.appId.trim() === '' ||
        aiSetting.value.apiKey.trim() === '' ||
        aiSetting.value.apiSecret.trim() === '');

    const placeholders = computed(() => ([
        ...aiSetting.value.placeholders,
        {
            label: '帮我润色',
            prefix: '帮我润色：'
        }
    ]))

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

    async function ask(id: number, content: string) {
        if (disabled.value) {
            return;
        }
        if (content.startsWith(HELP_ME_POLISH_IT)) {
            MessageUtil.info("润色中...");
            helpMePolishIt(id, aiSetting.value).then(() => {
                MessageUtil.success(`笔记【${id}】润色完成`)
                useRefreshNoteEvent.emit([id]);
            })
        }
    }

    return {aiSetting, placeholders, init, save, ask};

});
