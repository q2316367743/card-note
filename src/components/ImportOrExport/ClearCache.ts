import {listByAsync, saveListByAsync} from "@/utils/utools/DbStorageUtil";
import DbKeyEnum from "@/enumeration/DbKeyEnum";
import {NoteIndex} from "@/entity/Note";
import MessageBoxUtil, {MessageBoxLoadingReturn} from "@/utils/modal/MessageBoxUtil";
import MessageUtil from "@/utils/modal/MessageUtil";
import {useSyncStore} from "@/store/SyncStore";
import {fullSynchronization} from "@/components/SyncAlgorithm/IdleSync";

/**
 * 清除缓存
 */
export async function openClearCache() {
    let loading = MessageBoxUtil.loading("开始清理...");
    _openClearCache(loading)
        .then(() => MessageUtil.success("清理完成"))
        .catch(e => MessageUtil.error("清理失败", e))
        .finally(() => loading.close());

}

async function _openClearCache(loading: MessageBoxLoadingReturn) {

    // 先去判断是否需要同步
    loading.append("判断是否开启同步...")
    const client = useSyncStore().client;
    if (client) {
        loading.append("开始全量同步...")
        // 存在客户选，需要先全量同步
        await fullSynchronization(client, loading);
    }

    // 获取全部的ID
    const indexes = await listByAsync<NoteIndex>(DbKeyEnum.LIST_NOTE);

    // 清除已删除的索引
    loading.append("清除已删除的索引")
    indexes.list = indexes.list.filter(e => !e.deleted);

    await saveListByAsync(DbKeyEnum.LIST_NOTE, indexes.list, indexes.rev);

}
