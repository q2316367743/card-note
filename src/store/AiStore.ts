import {defineStore} from "pinia";
import {computed, ref, shallowRef, toRaw} from "vue";
import {AiPlaceholder, AiSetting, getDefaultAiSetting} from "@/entity/AiSetting";
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

    const placeholders = computed(() => ([
        {
            label: '帮我润色',
            prefix: '帮我润色：'
        },
        ...(aiSetting.value.placeholders || [])
    ]))



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
        for (let placeholder of placeholders.value) {

            if (content.startsWith(placeholder.prefix)) {
                MessageUtil.info("正在询问AI...");
                askToAi(id).then(() => {
                    MessageUtil.success(`笔记【${id}】AI处理完成`)
                    useRefreshNoteEvent.emit([id]);
                });
                return;
            }
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





    async function addPlaceholder(placeholder: AiPlaceholder) {
        if (placeholders.value.some(e => e.prefix === placeholder.prefix)) {
            return Promise.reject("存在重复的占位符");
        }
        placeholder = toRaw(placeholder);
        aiSetting.value.placeholders ? aiSetting.value.placeholders.push(placeholder) : aiSetting.value.placeholders = [placeholder];
        return save(aiSetting.value);
    }

    async function updatePlaceholder(index: number, placeholder: AiPlaceholder) {
        const newIndex = placeholders.value.findIndex(e => e.prefix === placeholder.prefix);
        if (newIndex !== index && newIndex !== -1) {
            return Promise.reject("存在重复的占位符");
        }
        placeholder = toRaw(placeholder);
        index -= 1;
        aiSetting.value.placeholders[index] = placeholder;
        return save(aiSetting.value);
    }

    async function removePlaceholder(index: number) {
        index -= 1;
        aiSetting.value.placeholders.splice(index, 1);
        return save(aiSetting.value);
    }

    return {
        aiSetting, placeholders, disabled,openAi,model,
        init, save,
        ask, askMulti, askByComment,
        addPlaceholder, updatePlaceholder, removePlaceholder
    };

});
