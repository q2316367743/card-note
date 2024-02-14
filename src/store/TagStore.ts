import {defineStore} from "pinia";
import {ref} from "vue";
import {listByAsync, saveListByAsync} from "@/utils/utools/DbStorageUtil";
import DbKeyEnum from "@/enumeration/DbKeyEnum";

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

    async function add(items: Array<string>) {
        items.forEach(item => tags.value.add(item));
        rev = await saveListByAsync(DbKeyEnum.LIST_TAG, Array.from(tags.value), rev)
    }

    async function addFromContent(content: string) {
        let tags = content.match(TAG_REGEX);
        if (tags) {
            await add(tags);
        }
    }

    async function remove(item: string) {
        tags.value.delete(item);
        rev = await saveListByAsync(DbKeyEnum.LIST_TAG, Array.from(tags.value), rev)
    }

    return {tags, add, addFromContent, remove, init}

});
