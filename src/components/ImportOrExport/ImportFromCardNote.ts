import {useFileSystemAccess} from "@vueuse/core";
import JSZip from "jszip";
import {listByAsync, removeOneByAsync, saveOneByAsync} from "@/utils/utools/DbStorageUtil";
import {NoteIndex} from "@/entity/Note";
import DbKeyEnum from "@/enumeration/DbKeyEnum";
import MessageBoxUtil, {MessageBoxLoadingReturn} from "@/utils/MessageBoxUtil";
import {useNoteStore} from "@/store/NoteStore";
import {fullSynchronization} from "@/components/SyncAlgorithm/IdleSync";
import {useSyncStore} from "@/store/SyncStore";
import MessageUtil from "@/utils/MessageUtil";

export function openImportFromCardNote() {
    let loading = MessageBoxUtil.loading("开始导入...");
    _openImportFromCardNote(loading)
        .then(() => MessageUtil.success("导入成功"))
        .catch(e => MessageUtil.error("导入失败", e))
        .finally(() => loading.close());

}

async function _openImportFromCardNote(loading: MessageBoxLoadingReturn) {
    const file = useFileSystemAccess({
        dataType: 'Blob',
        types: [{
            description: '压缩文件',
            accept: {
                "application/zip": ['.zip']
            }
        }]
    });
    await (file.open() as Promise<void>);
    const blob = file.data.value;
    if (!blob) {
        return;
    }
    loading.append("开始读取文件内容...")
    const zip = await JSZip.loadAsync(blob);
    // 删除当前存储
    loading.append("开始删除当前存储...")
    const indexes = await listByAsync<NoteIndex>(DbKeyEnum.LIST_NOTE);
    await removeOneByAsync(DbKeyEnum.LIST_NOTE, true);
    for (let noteIndex of indexes.list) {
        const key = `${DbKeyEnum.NOTE_ITEM}/${noteIndex.id}`;
        await removeOneByAsync(key, true);
    }
    await removeOneByAsync(DbKeyEnum.LIST_TAG, true);
    // 读取内容，保存
    loading.append("开始保存文件内容...")
    for (let path in zip.files) {
        const file = zip.file(path);
        if (!file) {
            continue;
        }
        const blob = await file.async('blob');
        await saveOne(path, blob);
    }

    // 重新初始化
    loading.append("开始重新初始化...")
    await useNoteStore().init(true);

    const client = useSyncStore().client;

    if (client) {

        loading.append("开始全量同步...")
        await fullSynchronization(client);

    }
}

function saveOne(key: string, value: Blob): Promise<void> {
    const fileReader = new FileReader();
    fileReader.readAsText(value, 'utf-8');
    return new Promise<void>((resolve, reject) => {
        fileReader.onload = async () => {
            if (!fileReader.result) {
                reject("文件读取失败：" + key);
                return;
            }
            const data = JSON.parse(fileReader.result as string);
            await saveOneByAsync<any>(key, data);
            resolve();
        };
        fileReader.onerror = reject;
    });
}
