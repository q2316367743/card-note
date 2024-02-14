import {DbRecord} from "@/utils/utools/DbStorageUtil";
import {NoteContent} from "@/entity/Note";
import {Modal} from "@arco-design/web-vue";
import TextEditor from "@/pages/home/components/TextEditor.vue";
import {useNoteStore} from "@/store/NoteStore";

export function openEditBox(record: DbRecord<NoteContent>) {
    return new Promise<void>((resolve,reject) => {
        function update(content: string) {
            useNoteStore().update(record, content, [])
                .then(resolve).catch(reject).finally(modalReturn.close)
        }

        const modalReturn = Modal.open({
            title: '卡片笔记',
            titleAlign: 'start',
            footer: false,
            draggable: true,
            content: () => <TextEditor content={record.record.content} onSave={update}/>
        });
    })
}
