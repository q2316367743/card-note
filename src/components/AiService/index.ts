import {AiSetting, AiTypeEnum} from "@/entity/AiSetting";
import {askToXunFei} from "@/components/AiService/ask/AskToXunFei";
import {useNoteStore} from "@/store/NoteStore";

export async function ask(question: string, setting: AiSetting) {
    if (setting.type === AiTypeEnum.XUN_FEI) {
        return await askToXunFei(question, setting);
    }else {
        return Promise.reject("Ai的类型未设置");

    }
}

/**
 * 帮我润色
 *
 * @example 帮我润色:${text}
 */
export async function helpMePolishIt(noteId: number, setting: AiSetting) {
    const noteContent = await useNoteStore().getOne(noteId);
    if (!noteContent) {
        return Promise.reject("系统异常，笔记不存在");
    }
    const question = noteContent.record.content;
    const content = question.substring(5);
    const result = await ask(question, setting);
    const newContent = "原卡片内容：~~"+ content.trim() + "~~\n\n==润色后内容：==\n" + result;
    noteContent.record.content = newContent;
    await useNoteStore().update(noteContent, newContent, noteContent.record.relationNotes);
}
