import {askToXunFei} from "@/components/AiService/ask/AskToXunFei";
import {useNoteStore} from "@/store/NoteStore";
import {DbRecord} from "@/utils/utools/DbStorageUtil";
import {NoteContent} from "@/entity/Note";
import {AI_ASSISTANT} from "@/store/AiStore";

async function ask(question: string) {
    return askMulti([question]);
}

async function askMulti(questions: Array<string>) {
    return await askToXunFei(questions);
}

/**
 * 询问AI
 */
export async function askToAi(noteId: number) {
    const noteContent = await useNoteStore().getOne(noteId);
    if (!noteContent) {
        return Promise.reject("系统异常，笔记不存在");
    }
    const question = noteContent.record.content;
    const content = question.substring(5);
    const result = await ask(question);
    const newContent = "**原卡片内容：**\n\n" + content.trim() + "\n\n\n\n**处理后内容：**\n\n" + result;
    noteContent.record.content = newContent;
    noteContent.record.role = 'robot';
    await useNoteStore().update(noteContent, newContent, noteContent.record.relationNotes);
}

export async function askMultiToAi(question: string, records: Array<DbRecord<NoteContent>>) {
    const res = await askMulti([...records.map(e => e.record.content), question]);
    await useNoteStore().add(res, records.map(e => ({
        noteId: 0,
        relationId: e.record.id,
        type: 'REFERENCE'
    })), 'robot');
}

/**
 * 向AI助手提问评论
 * @param source 源卡片内容
 * @param current 当前卡片内容
 */
export async function askCommentToAi(source: string, current: DbRecord<NoteContent>) {
    // 去除@AI助手的内容
    const question = current.record.content.replaceAll(AI_ASSISTANT, "");
    const res = await askMulti([source, question]);
    const newContent = current.record.content + "\n\n**回答：**\n" + res;
    // 更新卡片
    current.record.role = 'robot';
    await useNoteStore().update(current, newContent, current.record.relationNotes);
}
