import {getFromOneByAsync, listByAsync} from "@/utils/utools/DbStorageUtil";
import DbKeyEnum from "@/enumeration/DbKeyEnum";
import {NoteIndex} from "@/entity/Note";
import JSZip from 'jszip'
import {download} from "@/utils/lang/BrowserUtil";

/**
 * 导出作为卡片笔记
 */
export async function openExportForCardNote() {
    const zip = new JSZip();
    // 读取全部的卡片索引
    const indexes = await listByAsync<NoteIndex>(DbKeyEnum.LIST_NOTE);
    zip.file(DbKeyEnum.LIST_NOTE, JSON.stringify(indexes.list));
    // 获取笔记详情
    for (let noteIndex of indexes.list) {
        if (noteIndex.deleted) {
            continue;
        }
        const key = `${DbKeyEnum.NOTE_ITEM}/${noteIndex.id}`;
        const note = await getFromOneByAsync(key);
        if (note) {
            zip.file(key, JSON.stringify(note.record));
        }
    }
    // 获取标签内容
    const tags = await listByAsync<string>(DbKeyEnum.LIST_TAG);
    zip.file(DbKeyEnum.LIST_TAG, JSON.stringify(tags.list));

    zip.generateAsync({type: "blob"}).then(blob => {
        download(blob, '卡片笔记.zip', "application/zip");
    });

}
