import {AiSetting, AiTypeEnum} from "@/entity/AiSetting";
import {askToXunFei} from "@/components/AiService/ask/AskToXunFei";
import {useNoteStore} from "@/store/NoteStore";
import {DbRecord} from "@/utils/utools/DbStorageUtil";
import {NoteContent} from "@/entity/Note";

async function ask(question: string, setting: AiSetting) {
    return askMulti([question], setting);
}

async function askMulti(questions: Array<string>, setting: AiSetting) {
    if (setting.type === AiTypeEnum.XUN_FEI) {
        return await askToXunFei(questions, setting);
    } else {
        return Promise.reject("Ai的类型未设置");

    }
}

/**
 * 询问AI
 */
export async function askToAi(noteId: number, setting: AiSetting) {
    const noteContent = await useNoteStore().getOne(noteId);
    if (!noteContent) {
        return Promise.reject("系统异常，笔记不存在");
    }
    const question = noteContent.record.content;
    const content = question.substring(5);
    const result = await ask(question, setting);
    const newContent = "==原卡片内容：==\n\n" + content.trim() + "\n\n\n\n==处理后内容：==\n\n" + result;
    noteContent.record.content = newContent;
    await useNoteStore().update(noteContent, newContent, noteContent.record.relationNotes);
}

export async function askMultiToAi(question: string, records: Array<DbRecord<NoteContent>>, setting: AiSetting) {
    const res = await askMulti([...records.map(e => e.record.content), question], setting);
    await useNoteStore().add(res, records.map(e => ({
        noteId: 0,
        relationId: e.record.id,
        type: 'REFERENCE'
    })), false);
}
