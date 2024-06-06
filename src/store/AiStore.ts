import {defineStore} from "pinia";
import {computed, ref, shallowRef} from "vue";
import {AiSetting, getDefaultAiSetting} from "@/entity/AiSetting";
import {DbRecord, getFromOneByAsync, saveOneByAsync} from "@/utils/utools/DbStorageUtil";
import DbKeyEnum from "@/enumeration/DbKeyEnum";
import {askCommentToAi, askMultiToAi, askToAi} from "@/components/AiService";
import {useRefreshNoteEvent} from "@/store/NoteStore";
import MessageUtil from "@/utils/MessageUtil";
import {NoteContent} from "@/entity/Note";
import OpenAI from "openai";

export const AI_ASSISTANT: string = "@AI助手";

export const useAiStore = defineStore("ai", () => {
    const aiSetting = ref(getDefaultAiSetting());
    let rev: string | undefined = undefined;
    const openAi = shallowRef<OpenAI | null>(null);
    const model = computed(() => aiSetting.value.model);

    const disabled = computed(() =>
        aiSetting.value.url.trim() === '' ||
        aiSetting.value.token.trim() === '');

    function buildOpenAi() {
        openAi.value = null;
        if (aiSetting.value.url.trim() !== '' && aiSetting.value.token.trim() !== '') {
            const api = aiSetting.value.url;
            openAi.value = new OpenAI({
                baseURL: api + (api.endsWith('/') ? '' : '/') + 'v1',
                apiKey: aiSetting.value.token,
                dangerouslyAllowBrowser: true
            })
        }
    }

    async function init() {
        const res = await getFromOneByAsync<AiSetting>(DbKeyEnum.SETTING_AI);
        if (res) {
            aiSetting.value = Object.assign(aiSetting.value, res.record);
            rev = res.rev;
        }
        buildOpenAi();
    }

    async function save(res: AiSetting) {
        aiSetting.value = res;
        rev = await saveOneByAsync(DbKeyEnum.SETTING_AI, aiSetting.value, rev);
        buildOpenAi();
    }

    function ask(id: number, content: string) {
        if (disabled.value) {
            return;
        }

        if (content.startsWith(AI_ASSISTANT)) {
            MessageUtil.info("正在询问AI...");
            askToAi(id).then(() => {
                MessageUtil.success(`笔记【${id}】AI处理完成`)
                useRefreshNoteEvent.emit([id]);
            });
        }
    }

    function askMulti(question: string, records: Array<DbRecord<NoteContent>>) {
        if (disabled.value) {
            return;
        }
        MessageUtil.info("正在询问AI...");
        askMultiToAi(question, records)
            .then(() => {
                MessageUtil.success(`AI处理完成`);
                useRefreshNoteEvent.emit();
            })
            .catch(e => MessageUtil.error("AI处理失败", e));

    }

    async function askByComment(source: string, current: DbRecord<NoteContent>) {
        if (disabled.value) {
            return;
        }
        if (current.record.content.indexOf(AI_ASSISTANT) == -1) {
            return;
        }
        MessageUtil.info("正在询问AI...");
        await askCommentToAi(source, current);
        MessageUtil.success(`AI处理完成`);
        // 此处是更新
        useRefreshNoteEvent.emit([current.record.id]);

    }


    return {
        aiSetting, disabled, openAi, model,
        init, save,
        ask, askMulti, askByComment,
    };

});
