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
import {NoteContent, NoteIndex, NoteRelation} from "@/entity/Note";
import {useTagStore} from "@/store/TagStore";
import {useSyncEvent} from "@/store/SyncStore";

const HOUR = 1000 * 60 * 60;

// 增加被关联
async function addAssociated(relation: NoteRelation) {

    const relationNoteContent = await getFromOneByAsync(`${DbKeyEnum.NOTE_ITEM}/${relation.relationId}`);
    if (relationNoteContent) {

        // 此处需要修改旧的
        relationNoteContent.record.relationNotes.push(relation);
        await saveOneByAsync(`${DbKeyEnum.NOTE_ITEM}/${relationNoteContent.record.id}`, relationNoteContent.record, relationNoteContent.rev);
    }
}

//  删除被关联
async function removeAssociated(relation: NoteRelation) {
    const relationNoteContent = await getFromOneByAsync<NoteContent>(`${DbKeyEnum.NOTE_ITEM}/${relation.relationId}`);

    if (relationNoteContent) {

        const index = relationNoteContent.record.relationNotes
            .findIndex(e => e.noteId === relation.noteId &&
                e.relationId === relation.relationId &&
                e.type === relation.type);

        if (index > -1) {
            relationNoteContent.record.relationNotes.splice(index, 1);
            // 此处需要修改旧的
            await saveOneByAsync(`${DbKeyEnum.NOTE_ITEM}/${relationNoteContent.record.id}`, relationNoteContent.record, relationNoteContent.rev);
        }

    }
}


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
     * 查询一天的数据
     * @param date 当天的早八点时间戳
     */
    function oneDay(date: number): Promise<Array<DbRecord<NoteContent>>> {
        const start = date - 8 * HOUR;
        const end = date + 16 * HOUR;
        return listRecordByAsync<NoteContent>(ids.value
            .filter(id => id >= start && id <= end)
            .map(id => `${DbKeyEnum.NOTE_ITEM}/${id}`))
    }

    function allIds(): Array<number> {
        return ids.value;
    }

    function getOne(id: number): Promise<DbRecord<NoteContent> | null> {
        // TODO：此处需要缓存
        return getFromOneByAsync<NoteContent>(`${DbKeyEnum.NOTE_ITEM}/${id}`);
    }

    async function getMany(ids: Array<number>): Promise<Array<DbRecord<NoteContent>>> {
        if (!ids) {
            return Promise.resolve([]);
        }
        const items = await Promise.all(ids.map(id => getFromOneByAsync<NoteContent>(`${DbKeyEnum.NOTE_ITEM}/${id}`)));
        return items.filter(item => item !== null) as Array<DbRecord<NoteContent>>;
    }

    async function add(content: string, relationNotes: Array<NoteRelation>) {
        const now = new Date().getTime();
        const noteIndex: NoteIndex = {
            id: now,
            updateTime: now,
            top: false,
            deleted: false
        }
        const noteContent: NoteContent = {
            ...noteIndex,
            content,
            relationNotes: []
        }
        // 匹配标签
        useTagStore().addFromContent(content).then(() => console.debug("标签匹配完成"));

        // 修改关联数据
        for (let relationNote of relationNotes) {
            const relationNoteContent = await getOne(relationNote.relationId);
            if (relationNoteContent) {
                const relation = {
                    noteId: now,
                    relationId: relationNote.relationId,
                    type: relationNote.type
                };

                // 增加反向关联
                await addAssociated(relation);

                noteContent.relationNotes.push(relation)
            }
        }


        // 先增加数据
        await saveOneByAsync(`${DbKeyEnum.NOTE_ITEM}/${now}`, noteContent);

        // 最后增加索引
        indexes.value.unshift(noteIndex);
        rev = await saveListByAsync(DbKeyEnum.LIST_NOTE, indexes.value, rev);

        // 自动同步事件
        useSyncEvent.emit({key: DbKeyEnum.LIST_NOTE, type: 'put'});
        useSyncEvent.emit({key: `${DbKeyEnum.NOTE_ITEM}/${now}`, type: 'put'});
        relationNotes.forEach(relation => useSyncEvent.emit({
            key: `${DbKeyEnum.NOTE_ITEM}/${relation.relationId}`,
            type: 'put'
        }))
    }

    async function addBatch(noteContents: Array<NoteContent>) {
        for (let noteContent of noteContents) {
            // 匹配标签
            useTagStore().addFromContent(noteContent.content, false).then(() => console.debug("标签匹配完成"));
            // 先增加数据
            await saveOneByAsync(`${DbKeyEnum.NOTE_ITEM}/${noteContent.id}`, noteContent);
            // 在增加数组
            indexes.value.unshift({
                id: noteContent.id,
                updateTime: noteContent.updateTime,
                top: noteContent.top,
                deleted: noteContent.deleted
            });
        }
        rev = await saveListByAsync(DbKeyEnum.LIST_NOTE, indexes.value, rev);
    }

    async function update(record: DbRecord<NoteContent>, content: string, relationNotes: Array<NoteRelation>) {
        const id = record.record.id;
        const index = indexes.value.findIndex(e => e.id === record.record.id);
        if (index >= 0) {
            const needUpdateIds = new Array<number>();
            // 旧的笔记内容
            const oldNoteContent = await getOne(indexes.value[index].id);
            // 匹配标签
            useTagStore().addFromContent(content).then(() => console.debug("标签匹配完成"));
            // 更新数据
            const now = new Date().getTime();
            const newNoteContent: NoteContent = {
                id: id,
                updateTime: now,
                top: false,
                deleted: false,
                content,
                relationNotes: relationNotes.map(e => ({
                    noteId: id,
                    type: e.type,
                    relationId: e.relationId
                }))
            };

            // 处理链接问题
            if ((oldNoteContent && oldNoteContent.record.relationNotes.length > 0) || relationNotes.length > 0) {
                // 旧的关系
                const oldRelation = new Set(oldNoteContent ? oldNoteContent.record.relationNotes : []);
                const newRelation = new Set(relationNotes);
                for (let old of oldRelation) {
                    // 旧的有，新的没有，删除
                    if (!newRelation.has(old)) {
                        await removeAssociated(old);
                    }
                }
                for (let newItem of newRelation) {
                    if (!oldRelation.has(newItem)) {
                        // 新的有，旧的没有，添加

                        const relation = {
                            noteId: id,
                            relationId: newItem.relationId,
                            type: newItem.type
                        };

                        // 增加反向关联
                        await addAssociated(relation);
                    }

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

            // 自动同步事件
            useSyncEvent.emit({key: DbKeyEnum.LIST_NOTE, type: 'put'});
            useSyncEvent.emit({key: `${DbKeyEnum.NOTE_ITEM}/${id}`, type: 'put'});
            needUpdateIds.forEach(updateId => useSyncEvent.emit({
                key: `${DbKeyEnum.NOTE_ITEM}/${updateId}`,
                type: 'put'
            }))
        }
    }

    async function remove(id: number) {
        const index = indexes.value.findIndex(e => e.id === id);
        if (index >= 0) {
            indexes.value[index].deleted = true;
            rev = await saveListByAsync(DbKeyEnum.LIST_NOTE, indexes.value, rev);
            // 删除数据
            await removeOneByAsync(`${DbKeyEnum.NOTE_ITEM}/${id}`);

            // 自动同步事件
            useSyncEvent.emit({key: DbKeyEnum.LIST_NOTE, type: 'put'});
            useSyncEvent.emit({key: `${DbKeyEnum.NOTE_ITEM}/${id}`, type: 'remove'});
        }
    }

    return {init, allIds, page, oneDay, getOne, getMany, add, addBatch, update, remove}

});
