import {useSyncStore} from "@/store/SyncStore";
import {
    getFromOneByAsync,
    listByAsync,
    removeOneByAsync,
    saveListByAsync,
    saveOneByAsync
} from "@/utils/utools/DbStorageUtil";
import DbKeyEnum from "@/enumeration/DbKeyEnum";
import {WebDAVClient} from "webdav";
import {NoteIndex} from "@/entity/Note";
import {arraysHaveSameElements, map} from "@/utils/ArrayUtil";
import MessageUtil from "@/utils/MessageUtil";
import {buildPath, folderCreate} from "@/components/SyncAlgorithm/CommonSync";
import {MessageBoxLoadingReturn} from "@/utils/MessageBoxUtil";
import {useNoteStore} from "@/store/NoteStore";
import {useTagStore} from "@/store/TagStore";

export function useIdleSync() {
    if (useSyncStore().disableIdleSync) {
        // 禁止空闲全量同步
        return;
    }
    const client = useSyncStore().client;
    if (!client) {
        // 客户端未初始化
        return;
    }
    fullSynchronization(client).then(() => console.log("空闲同步成功"))
        .catch(e => {
            MessageUtil.error("空闲同步失败", e)
            utools.showNotification("空闲同步失败：" + e.message)
        });
}

/**
 * 全量同步
 * @param client webdav客户端
 * @param loading 加载框
 */
export async function fullSynchronization(client: WebDAVClient, loading?: MessageBoxLoadingReturn) {
    await folderCreate(client);
    // 全量同步笔记
    loading && loading.append("正在同步笔记...");
    await fullSynchronizationByNote(client);
    // 全量同步标签
    loading && loading.append("正在同步标签...");
    await fullSynchronizationByTag(client);
    loading && loading.append("正在初始化笔记");
    await useNoteStore().init(true);
    loading && loading.append("正在初始化标签");
    await useTagStore().init();
}

async function fullSynchronizationByNote(client: WebDAVClient) {
    // 获取本地已同步的笔记索引
    const localNoteRes = await listByAsync<NoteIndex>(DbKeyEnum.LIST_NOTE);
    let localNoteIndexes = localNoteRes.list;
    let originNoteIndexes: Array<NoteIndex>;
    try {
        // 获取远程的笔记索引
        const originNoteRes = await client.getFileContents(buildPath(DbKeyEnum.LIST_NOTE), {
            format: 'text',
        }) as string
        const originNoteIndexTemp = JSON.parse(originNoteRes);
        if (originNoteIndexTemp instanceof Array) {
            originNoteIndexes = originNoteIndexTemp
        } else {
            originNoteIndexes = [];
        }
    } catch (e) {
        console.error("获取远程笔记索引失败，尝试删除文件后重试", e);
        originNoteIndexes = new Array<NoteIndex>();
    }
    // 变为map
    const localNoteIndexMap = map(localNoteIndexes, 'id');
    const originNoteIndexMap = map(originNoteIndexes, 'id');
    // 集合上取并集，这些是可能有变化的笔记索引
    const unionNoteIndexes = new Set<number>();
    localNoteIndexes.forEach(index => unionNoteIndexes.add(index.id));
    originNoteIndexes.forEach(index => unionNoteIndexes.add(index.id));
    // 新的笔记索引
    const newNoteIndexes = new Array<NoteIndex>();
    let noteUpdateCount = 0;
    // 同步笔记，处理完成后，map中数据为最新数据
    for (let unionNoteIndex of unionNoteIndexes) {
        // 先获取本地数据
        const localNoteIndex = localNoteIndexMap.get(unionNoteIndex);
        // 在获取远程数据
        const originNoteIndex = originNoteIndexMap.get(unionNoteIndex);
        if (localNoteIndex && originNoteIndex) {
            const key = `${DbKeyEnum.NOTE_ITEM}/${localNoteIndex.id}`;
            if (localNoteIndex.deleted && !originNoteIndex.deleted) {
                // 本地删除了，但是远程没删除，删除远程内容
                await client.deleteFile(buildPath(key));
                // 索引使用本地数据
                newNoteIndexes.push(localNoteIndex);
            } else if (!localNoteIndex.deleted && originNoteIndex.deleted) {
                // 远程删除了，本地没删除，删除本地内容
                await removeOneByAsync(key, true);
                // 索引使用远程数据
                newNoteIndexes.push(originNoteIndex);
            } else if (localNoteIndex.updateTime > originNoteIndex.updateTime) {
                // 本地更新时间大于远程，说明本地有更新，需要上传
                const content = await getFromOneByAsync(key);
                await client.putFileContents(buildPath(key), JSON.stringify(content));
                // 索引使用本地数据
                newNoteIndexes.push(localNoteIndex);
            } else if (localNoteIndex.updateTime < originNoteIndex.updateTime) {
                //  本地更新时间小于远程，说明远程有更新，需要下载
                const originContentStr = await client.getFileContents(buildPath(key), {
                    format: 'text'
                }) as string;
                const content = JSON.parse(originContentStr);
                await saveOneByAsync(key, content);
                // 索引使用远程数据
                newNoteIndexes.push(originNoteIndex);
            } else {
                // 数据完全一致，使用本地
                noteUpdateCount += 1;
                newNoteIndexes.push(localNoteIndex);
            }
        } else if (localNoteIndex) {
            // 本地有的，但是远程没有的，需要新增
            const key = `${DbKeyEnum.NOTE_ITEM}/${localNoteIndex.id}`;
            if (!localNoteIndex.deleted) {
                // 本地有的，但是远程没有的，需要新增到远程
                let content = await getFromOneByAsync(key);
                content && await client.putFileContents(buildPath(key), JSON.stringify(content.record));
            }
            // 新增到本地索引中
            newNoteIndexes.push(localNoteIndex);
        } else if (originNoteIndex) {
            // 本地没有，但是远程有的，需要新增到本地
            const key = `${DbKeyEnum.NOTE_ITEM}/${originNoteIndex.id}`;
            // 下载内容
            if (!originNoteIndex.deleted) {
                const originContentStr = await client.getFileContents(buildPath(key), {
                    format: 'text'
                }) as string;
                const content = JSON.parse(originContentStr);
                await saveOneByAsync(key, content);
            }
            // 新增到本地索引中
            newNoteIndexes.push(originNoteIndex);
        } else {
            // 本地远程都没有
        }
    }

    if (noteUpdateCount === unionNoteIndexes.size) {
        // 没有变化
        console.log(`更新数量：【${noteUpdateCount}】，合并数量：【${unionNoteIndexes.size}】，未发现更新`)
        return;
    }

    // 保存本地索引
    await saveListByAsync(DbKeyEnum.LIST_NOTE, newNoteIndexes, localNoteRes.rev);
    // 保存远程索引
    await client.putFileContents(buildPath(DbKeyEnum.LIST_NOTE), JSON.stringify(newNoteIndexes));

}

async function fullSynchronizationByTag(client: WebDAVClient) {
    // 获取本地标签
    const localTags = await listByAsync<string>(DbKeyEnum.LIST_TAG);
    let originTags: Array<string>;
    try {
        // 获取远程标签
        const originTagRes = await client.getFileContents(buildPath(DbKeyEnum.LIST_TAG), {
            format: 'text'
        }) as string;
        const originTagsTemp = JSON.parse(originTagRes);
        if (originTagsTemp instanceof Array) {
            originTags = originTagsTemp
        } else {
            originTags = [];
        }
    } catch (e) {
        console.error("获取远程标签失败，尝试删除文件后重试", e);
        originTags = new Array<string>();
    }

    if (arraysHaveSameElements(localTags.list, originTags)){
        console.log("远程标签与本地标签一致，无需同步");
        return;
    }


    const newTags = Array.from(new Set([
        ...localTags.list,
        ...originTags
    ]));

    // 保存本地标签
    await saveListByAsync(DbKeyEnum.LIST_TAG, newTags, localTags.rev);
    // 保存远程标签
    await client.putFileContents(buildPath(DbKeyEnum.LIST_TAG), JSON.stringify(newTags));
}
