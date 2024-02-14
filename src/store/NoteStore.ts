import {defineStore} from "pinia";
import {DbRecord, listByAsync, listRecordByAsync, saveListByAsync, saveOneByAsync} from "@/utils/utools/DbStorageUtil";
import DbKeyEnum from "@/enumeration/DbKeyEnum";
import {ref} from "vue";
import {Note} from "@/entity/Note";

export const useNoteStore = defineStore('note', () => {
    const ids = ref(new Array<number>());
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
    function page(offset: number, limit: number): Promise<Array<DbRecord<Note>>> {
        if (offset >= ids.value.length) {
            return Promise.resolve([]);
        }
        const numbers = ids.value.slice(offset, Math.min(offset + limit, ids.value.length));
        return listRecordByAsync<Note>(numbers.map(num => `${DbKeyEnum.NOTE_ITEM}/${num}`))
    }

    async function add(content: string, relationNotes: Array<number>) {
        const now = new Date();
        const note: Note = {
            id: now.getTime(),
            createTime: now,
            updateTime: now,
            content,
            relationNotes
        }
        // 先增加数据
        await saveOneByAsync(`${DbKeyEnum.NOTE_ITEM}/${note.id}`, note);
        // 在增加数组
        ids.value.unshift(note.id);
        rev = await saveListByAsync(DbKeyEnum.LIST_NOTE, ids.value, rev);
    }

    return {init, page, add}

});
