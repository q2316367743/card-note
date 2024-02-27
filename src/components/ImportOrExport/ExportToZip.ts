import {listRecordByAsync} from "@/utils/utools/DbStorageUtil";
import DbKeyEnum from "@/enumeration/DbKeyEnum";
import {NoteContent} from "@/entity/Note";
import JSZip from "jszip";
import {download} from "@/utils/BrowserUtil";
import {toDateString} from "xe-utils";

export async function openExportToZip() {
    const items = await listRecordByAsync<NoteContent>(DbKeyEnum.NOTE_ITEM)
    // zip
    const zip = new JSZip();
    console.log(items)
    for (let noteContent of items) {
        zip.file(`/${toDateString(noteContent.record.id)}.md`, noteContent.record.content);
        console.log(noteContent)
    }
    const blob = await zip.generateAsync({type: "blob"});
    download(blob, "卡片笔记.zip", "application/zip");
}
