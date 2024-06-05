import {defineStore} from "pinia";
import {
    DbRecord, getFromOneByAsync,
    listByAsync,
    listRecordByAsync,
    removeOneByAsync,
    saveListByAsync,
    saveOneByAsync
} from "@/utils/utools/DbStorageUtil";
import DbKeyEnum from "@/enumeration/DbKeyEnum";
import {computed, ref} from "vue";
import {NoteContent, NoteIndex, NoteRelation, NoteRole} from "@/entity/Note";
import {matchTagFromContent, useTagStore} from "@/store/TagStore";
import {useSyncEvent} from "@/store/SyncStore";
import {useEventBus} from "@vueuse/core";
import {useAiStore} from "@/store/AiStore";

const HOUR = 1000 * 60 * 60;

function equalRelation(a: NoteRelation, b: NoteRelation): boolean {
    return a.noteId === b.noteId && a.relationId === b.relationId && a.type === b.type;
}

// 增加被关联
async function addAssociated(relation: NoteRelation) {
    const relationNoteContent = await getFromOneByAsync(`${DbKeyEnum.NOTE_ITEM}/${relation.relationId}`);
    if (relationNoteContent) {
        // 此处需要修改旧的
        relationNoteContent.record.relationNotes.push(relation);
        await saveOneByAsync(`${DbKeyEnum.NOTE_ITEM}/${relationNoteContent.record.id}`, relationNoteContent.record, relationNoteContent.rev);
    }
}

/**
 * 删除被关联，被关联着，关联ID等于自己的ID
 */
async function removeAssociated(relation: NoteRelation, id: number) {

    const relationNoteContent = await getFromOneByAsync<NoteContent>(`${DbKeyEnum.NOTE_ITEM}/${id}`);

    if (relationNoteContent) {

        relationNoteContent.record.relationNotes = relationNoteContent.record.relationNotes.filter(e => !equalRelation(e, relation));
        // 此处需要修改旧的
        await saveOneByAsync(`${DbKeyEnum.NOTE_ITEM}/${relationNoteContent.record.id}`, relationNoteContent.record, relationNoteContent.rev);

    }
}


export const useOpenNoteEvent = useEventBus<number>('open-note');
export const useSearchNoteEvent = useEventBus<string>('search-note');
export const useRefreshNoteEvent = useEventBus<Array<number> | null>('refresh-note');

export const useNoteStore = defineStore('note', () => {
    const indexes = ref(new Array<NoteIndex>());
    let rev: string | undefined = undefined;
    let isInit = false;

    const ids = computed(() => indexes.value
        .filter(index => !index.deleted)
        .map(index => index.id)
        .sort((a, b) => b - a));

    async function init(force: boolean = false) {
        if (isInit && !force) {
            return;
        }
        isInit = true;
        const res = await listByAsync(DbKeyEnum.LIST_NOTE);
        indexes.value = res.list;
        rev = res.rev;
    }

    /**
     * 分页获取笔记
     * @param offset 偏移量
     * @param limit 限制
     *
     * @return 笔记列表，如果没有更多数据，则返回空数组
     */
    function page(offset: number, limit: number): Promise<Array<DbRecord<NoteContent>>> {
        if (offset >= ids.value.length) {
            return Promise.resolve([]);
        }
        const items = ids.value.slice(offset, Math.min(offset + limit, ids.value.length));
        return listRecordByAsync<NoteContent>(items.map(item => `${DbKeyEnum.NOTE_ITEM}/${item}`))
    }

    /**
     * 搜索获取笔记
     *
     * @param keywords 关键字
     *
     * @return 笔记列表
     */
    async function search(keywords: string[]): Promise<Array<DbRecord<NoteContent>>> {
        const items = new Array<DbRecord<NoteContent>>();
        for (let id of ids.value) {
            const content = await getFromOneByAsync<NoteContent>(`${DbKeyEnum.NOTE_ITEM}/${id}`);
            if (content) {
                if (keywords.every(keyword => content.record.content.indexOf(keyword) > -1)) {
                    items.push(content);
                }
            }
        }
        return items;
    }

    /**
     * 查询一天的数据
     * @param date 当天的早八点时间戳
     */
    function oneDay(date: number): Promise<Array<DbRecord<NoteContent>>> {
        const start = date;
        const end = date + 24 * HOUR;
        return listRecordByAsync<NoteContent>(ids.value
            .filter(id => id >= start && id <= end)
            .map(id => `${DbKeyEnum.NOTE_ITEM}/${id}`))
    }

    function allIds(): Array<number> {
        return ids.value;
    }

    function getOne(id: number): Promise<DbRecord<NoteContent> | null> {
        return getFromOneByAsync<NoteContent>(`${DbKeyEnum.NOTE_ITEM}/${id}`);
    }

    async function getMany(ids: Array<number>): Promise<Array<DbRecord<NoteContent>>> {
        if (!ids) {
            return Promise.resolve([]);
        }
        return listRecordByAsync<NoteContent>(ids.map(id => `${DbKeyEnum.NOTE_ITEM}/${id}`));
    }

    async function add(content: string, relationNotes: Array<NoteRelation>, ai: boolean = true, role: NoteRole = 'user'): Promise<NoteContent> {
        const now = new Date().getTime();
        const noteIndex: NoteIndex = {
            id: now,
            updateTime: now,
            top: false,
            deleted: false,
            role
        }
        const tags = matchTagFromContent(content);
        const noteContent: NoteContent = {
            ...noteIndex,
            content,
            relationNotes: [],
            tags
        }
        // 匹配标签
        useTagStore().add(tags).then(() => console.debug("标签匹配完成"));

        // 修改关联数据
        for (let relationNote of relationNotes) {
            const relation = {
                noteId: now,
                relationId: relationNote.relationId,
                type: relationNote.type
            };

            // 增加反向关联
            await addAssociated(relation);

            noteContent.relationNotes.push(relation)
        }


        // 先增加数据
        await saveOneByAsync(`${DbKeyEnum.NOTE_ITEM}/${now}`, noteContent);

        // 最后增加索引
        indexes.value.unshift(noteIndex);
        rev = await saveListByAsync(DbKeyEnum.LIST_NOTE, indexes.value, rev);

        if (ai) {
            // AI功能
            useAiStore().ask(noteIndex.id, content);
        }

        // 自动同步事件
        useSyncEvent.emit({key: DbKeyEnum.LIST_NOTE, type: 'put'});
        useSyncEvent.emit({key: `${DbKeyEnum.NOTE_ITEM}/${now}`, type: 'put'});
        relationNotes.forEach(relation => useSyncEvent.emit({
            key: `${DbKeyEnum.NOTE_ITEM}/${relation.relationId}`,
            type: 'put'
        }));

        return noteContent;
    }

    async function addBatch(noteContents: Array<NoteContent>) {
        for (let noteContent of noteContents) {
            // 匹配标签
            useTagStore().addFromContent(noteContent.content, false).then(() => console.debug("标签匹配完成"));
            // 先增加数据
            await saveOneByAsync(`${DbKeyEnum.NOTE_ITEM}/${noteContent.id}`, noteContent);
            // 在增加数组
            indexes.value.push({
                id: noteContent.id,
                updateTime: noteContent.updateTime,
                top: noteContent.top,
                deleted: noteContent.deleted
            });
        }
        rev = await saveListByAsync(DbKeyEnum.LIST_NOTE, indexes.value, rev);
    }

    /**
     * 更新记录
     * @param record
     * @param content
     * @param noteRelations 此处是全部关联的笔记
     *
     * @return 受到影响的笔记
     */
    async function update(record: DbRecord<NoteContent>, content: string, noteRelations: Array<NoteRelation>): Promise<Array<number>> {
        const id = record.record.id;
        const index = indexes.value.findIndex(e => e.id === record.record.id);
        const relationNoteIds = noteRelations.filter(e => e.type !== 'COMMENT').map(e => e.relationId);
        if (index >= 0) {
            const needUpdateIds = new Array<number>();
            // 旧的笔记内容
            const oldNoteContent = await getOne(id);
            const oldRelationNotes = oldNoteContent ? oldNoteContent.record.relationNotes : [];
            const oldComments = oldRelationNotes.filter(e => e.type === 'COMMENT');
            // 旧的正向关联
            const oldRelations = oldRelationNotes.filter(e => e.type === 'REFERENCE' && e.noteId === id);
            // 旧的被关联
            const oldAssociated = oldRelationNotes.filter(e => e.type === 'REFERENCE' && e.relationId === id);
            // 新的关联
            const newNoteRelations = relationNoteIds.map(e => ({
                noteId: id,
                type: 'REFERENCE',
                relationId: e
            } as NoteRelation));
            // 匹配标签
            const tags = matchTagFromContent(content);
            useTagStore().add(tags).then(() => console.debug("标签匹配完成"));
            // 更新数据
            const now = new Date().getTime();

            const newNoteContent: NoteContent = {
                id: id,
                updateTime: now,
                top: false,
                deleted: false,
                content,
                role: record.record.role,
                relationNotes: [
                    // 评论不动
                    ...oldComments,
                    // 旧的反向关联不动
                    ...oldAssociated,
                    // 新的关联
                    ...newNoteRelations
                ],
                tags
            };

            // 处理链接问题
            for (let old of oldRelations) {
                // 旧的有，新的没有，删除关联
                if (newNoteRelations.every(e => !equalRelation(e, old))) {
                    await removeAssociated(old, old.relationId);
                    needUpdateIds.push(old.relationId);
                }
            }
            for (let newItem of newNoteRelations) {
                // 新的有，旧的没有，增加反向关联
                if (oldRelations.every(e => e.noteId !== newItem.noteId || e.relationId !== newItem.relationId || e.type !== newItem.type)) {
                    await addAssociated({
                        noteId: id,
                        relationId: newItem.relationId,
                        type: "REFERENCE"
                    });
                    needUpdateIds.push(newItem.relationId);
                }

            }

            await saveOneByAsync<NoteContent>(`${DbKeyEnum.NOTE_ITEM}/${id}`, newNoteContent, record.rev);

            // 更新数组
            indexes.value[index] = {
                id: id,
                updateTime: now,
                top: false,
                deleted: false,
            }
            rev = await saveListByAsync(DbKeyEnum.LIST_NOTE, indexes.value, rev);

            // AI功能
            useAiStore().ask(id, content);

            // 自动同步事件
            useSyncEvent.emit({key: DbKeyEnum.LIST_NOTE, type: 'put'});
            useSyncEvent.emit({key: `${DbKeyEnum.NOTE_ITEM}/${id}`, type: 'put'});
            needUpdateIds.forEach(updateId => useSyncEvent.emit({
                key: `${DbKeyEnum.NOTE_ITEM}/${updateId}`,
                type: 'put'
            }));
            return Promise.resolve(needUpdateIds);
        }
        return Promise.resolve([]);
    }

    async function remove(id: number): Promise<Array<number>> {
        const index = indexes.value.findIndex(e => e.id === id);
        const needUpdateIds = new Array<number>();
        if (index >= 0) {

            // 1. 删除索引
            indexes.value[index].deleted = true;
            rev = await saveListByAsync(DbKeyEnum.LIST_NOTE, indexes.value, rev);
            // 2. 删除数据
            const old = await getOne(id);
            await removeOneByAsync(`${DbKeyEnum.NOTE_ITEM}/${id}`);
            if (old) {
                // 3. 删除关联及评论
                for (let relationNote of old.record.relationNotes) {
                    if (relationNote.noteId === id) {
                        await removeAssociated(relationNote, relationNote.relationId);
                        needUpdateIds.push(relationNote.relationId);
                    } else if (relationNote.relationId === id) {
                        await removeAssociated(relationNote, relationNote.noteId);
                        needUpdateIds.push(relationNote.noteId);
                    }
                }
            }

            // 自动同步事件
            useSyncEvent.emit({key: DbKeyEnum.LIST_NOTE, type: 'put'});
            useSyncEvent.emit({key: `${DbKeyEnum.NOTE_ITEM}/${id}`, type: 'remove'});
            needUpdateIds.forEach(id => useSyncEvent.emit({key: `${DbKeyEnum.NOTE_ITEM}/${id}`, type: 'put'}))
        }
        return Promise.resolve(needUpdateIds);
    }

    return {init, allIds, page, search, oneDay, getOne, getMany, add, addBatch, update, remove}

});
