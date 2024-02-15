import {DbRecord} from "@/utils/utools/DbStorageUtil";
import {NoteContent, NoteRelation} from "@/entity/Note";
import {Modal} from "@arco-design/web-vue";
import TextEditor from "@/pages/home/components/TextEditor.vue";
import {useNoteStore} from "@/store/NoteStore";

export function openEditBox(record: DbRecord<NoteContent>): Promise<Array<number>> {
    return new Promise<Array<number>>((resolve, reject) => {
        function update(content: string, relationNotes: Array<NoteRelation>) {
            useNoteStore().update(record, content, relationNotes)
                .then(resolve).catch(reject).finally(modalReturn.close)
        }

        const modalReturn = Modal.open({
            title: '卡片笔记',
            titleAlign: 'start',
            footer: false,
            draggable: true,
            content: () => <TextEditor content={record.record.content} relationNotes={record.record.relationNotes}
                                       noteId={record.record.id} onSave={update}/>
        });
    })
}
