import {defineStore} from "pinia";
import {ref} from "vue";
import {listByAsync, saveListByAsync} from "@/utils/utools/DbStorageUtil";
import DbKeyEnum from "@/enumeration/DbKeyEnum";
import {useSyncEvent} from "@/store/SyncStore";

export const SOURCE_TAG_REGEX = /#[^\s。]+/g;
export const TAG_REGEX = /(?<=#)[^\s。]+/g;

export const useTagStore = defineStore("tag", () => {
    const tags = ref<Set<string>>(new Set<string>());
    let rev: string | undefined = "";

    async function init() {
        const res = await listByAsync(DbKeyEnum.LIST_TAG);
        tags.value = new Set(res.list);
        rev = res.rev;
    }

    async function add(items: Array<string>, sync: boolean = true) {
        items.forEach(item => tags.value.add(item));
        rev = await saveListByAsync(DbKeyEnum.LIST_TAG, Array.from(tags.value), rev);

        // 自动同步事件
        sync && useSyncEvent.emit({key: DbKeyEnum.LIST_TAG, type: 'put'});
    }

    async function addFromContent(content: string, sync: boolean = true) {
        let tags = content.match(TAG_REGEX);
        if (tags) {
            await add(tags, sync);
        }
    }

    async function remove(item: string) {
        tags.value.delete(item);
        rev = await saveListByAsync(DbKeyEnum.LIST_TAG, Array.from(tags.value), rev);

        // 自动同步事件
        useSyncEvent.emit({key: DbKeyEnum.LIST_TAG, type: 'put'});
    }

    return {tags, add, addFromContent, remove, init}

});
