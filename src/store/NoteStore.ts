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
import {ref} from "vue";
import {NoteContent, NoteIndex} from "@/entity/Note";
import {useTagStore} from "@/store/TagStore";

const HOUR = 1000 * 60 * 60;

export const useNoteStore = defineStore('note', () => {
    const ids = ref(new Array<NoteIndex>());
    let rev: string | undefined = undefined;
    let isInit = false;

    async function init() {
        if (isInit) {
            return;
        }
        isInit = true;
        const res = await listByAsync(DbKeyEnum.LIST_NOTE);
        ids.value = res.list;
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
        const indexes = ids.value.slice(offset, Math.min(offset + limit, ids.value.length));
        return listRecordByAsync<NoteContent>(indexes.map(index => `${DbKeyEnum.NOTE_ITEM}/${index.id}`))
    }

    /**
     * 查询一天的数据
     * @param date 当天的早八点时间戳
     */
    function oneDay(date: number): Promise<Array<DbRecord<NoteContent>>> {
        const start = date - 8 * HOUR;
        const end = date + 16 * HOUR;
        return listRecordByAsync<NoteContent>(ids.value
            .filter(index => index.id >= start && index.id <= end)
            .map(index => `${DbKeyEnum.NOTE_ITEM}/${index.id}`))
    }

    function allIds(): Array<number> {
        return ids.value.map(e => e.id);
    }

    function getOne(id: number): Promise<DbRecord<NoteContent> | null> {
        return getFromOneByAsync<NoteContent>(`${DbKeyEnum.NOTE_ITEM}/${id}`);
    }

    async function add(content: string, relationNotes: Array<number>) {
        const now = new Date().getTime();
        const noteIndex: NoteIndex = {
            id: now,
            updateTime: now,
            top: false
        }
        const nodeContent: NoteContent = {
            ...noteIndex,
            content,
            relationNotes
        }
        // 匹配标签
        useTagStore().addFromContent(content).then(() => console.debug("标签匹配完成"));
        // 先增加数据
        await saveOneByAsync(`${DbKeyEnum.NOTE_ITEM}/${now}`, nodeContent);
        // 在增加数组
        ids.value.unshift(noteIndex);
        rev = await saveListByAsync(DbKeyEnum.LIST_NOTE, ids.value, rev);
    }

    async function update(record: DbRecord<NoteContent>, content: string, relationNotes: Array<number>) {
        const id = record.record.id;
        const index = ids.value.findIndex(e => e.id === record.record.id);
        if (index >= 0) {
            // 匹配标签
            useTagStore().addFromContent(content).then(() => console.debug("标签匹配完成"));
            // 更新数据
            const now = new Date().getTime();
            await saveOneByAsync<NoteContent>(`${DbKeyEnum.NOTE_ITEM}/${id}`, {
                id: id,
                updateTime: now,
                top: false,
                content,
                relationNotes
            }, record.rev);
            // 更新数组
            ids.value[index] = {
                id: id,
                updateTime: now,
                top: false,
            }
            rev = await saveListByAsync(DbKeyEnum.LIST_NOTE, ids.value, rev);
        }
    }

    async function remove(id: number) {
        const index = ids.value.findIndex(e => e.id === id);
        if (index >= 0) {
            ids.value.splice(index, 1);
            rev = await saveListByAsync(DbKeyEnum.LIST_NOTE, ids.value, rev);
            // 删除数据
            await removeOneByAsync(`${DbKeyEnum.NOTE_ITEM}/${id}`);
        }
    }

    return {init, allIds, page, oneDay, getOne, add, update, remove}

});
