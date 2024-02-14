import {DbRecord} from "@/utils/utools/DbStorageUtil";
import {Note} from "@/entity/Note";
import {Modal} from "@arco-design/web-vue";
import MonacoEditor from "@/pages/home/components/MonacoEditor.vue";
import {useNoteStore} from "@/store/NoteStore";

export function openEditBox(record: DbRecord<Note>) {
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
            content: () => <MonacoEditor content={record.record.content} onSave={update}/>
        });
    })
}
