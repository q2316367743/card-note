import {DbRecord} from "@/utils/utools/DbStorageUtil";
import {NoteContent} from "@/entity/Note";
import {toDateString} from "xe-utils";
import {download} from "@/utils/BrowserUtil";

export async function exportOneMarkdown(notes: Array<DbRecord<NoteContent>>, title?: string): Promise<void> {
    const contents = new Array<string>();
    for (let note of notes) {
        let content = "## " + toDateString(note.record.id);
        content += "\n\n" + note.record.content;
        contents.push(content);
    }
    let data = contents.join("\n\n---\n\n");
    if (title) {
        data = "# " + title + '\n\n';
    }
    download(data, "笔记.md", "text/markdown");
}
