import MessageBoxUtil, {MessageBoxLoadingReturn} from "@/utils/modal/MessageBoxUtil";
import MessageUtil from "@/utils/modal/MessageUtil";
import JSZip from "jszip";
import {NoteContent} from "@/entity/Note";
import DbKeyEnum from "@/enumeration/DbKeyEnum";
import {useNoteStore} from "@/store/NoteStore";
import {useSyncStore} from "@/store/SyncStore";
import {fullSynchronization} from "@/components/SyncAlgorithm/IdleSync";

export function openImportFromKb(blob: Blob) {
    let loading = MessageBoxUtil.loading("开始导入...");
    _openImportFromKb(loading, blob)
        .then(() => MessageUtil.success("导入成功"))
        .catch(e => MessageUtil.error("导入失败", e))
        .finally(() => loading.close());

}

async function _openImportFromKb(loading: MessageBoxLoadingReturn, blob: Blob) {
    if (!blob) {
        return;
    }
    loading.append("开始读取文件内容...")
    const zip = await JSZip.loadAsync(blob);
    // 读取内容，保存
    loading.append("开始解析文件内容...");
    const notes = new Array<NoteContent>();
    for (let path in zip.files) {
        const file = zip.file(path);
        if (!file) {
            continue;
        }
        if (!path.startsWith(DbKeyEnum.NOTE_ITEM)) {
            continue;
        }
        const blob = await file.async('blob');
        const contentStr = await blobToStr(blob);
        const note = JSON.parse(contentStr) as NoteContent;
        notes.push(note);
    }

    loading.append("开始导入...");

    await useNoteStore().addBatch(notes);

    // 重新初始化
    loading.append("开始重新初始化...")
    await useNoteStore().init(true);

    const client = useSyncStore().client;

    if (client) {

        loading.append("开始全量同步...")
        await fullSynchronization(client);

    }
}

function blobToStr(blob: Blob): Promise<string> {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = function (e) {
            if (e.target) {
                resolve(e.target.result as string);
            }
        };
        reader.onerror = function (e) {
            reject(e);
        };
        reader.readAsText(blob);
    });
}
