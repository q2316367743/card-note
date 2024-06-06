import {DbRecord} from "@/utils/utools/DbStorageUtil";
import {NoteContent, NoteRelation} from "@/entity/Note";
import ArcoVue, {Modal} from "@arco-design/web-vue";
import TextEditor from "@/components/TextEditor/index.vue";
import {useNoteStore} from "@/store/NoteStore";
import {createApp, ref, watch, App} from "vue";
import ArcoVueIcon from "@arco-design/web-vue/es/icon";

export function openEditBox(record: DbRecord<NoteContent>): Promise<Array<number>> {
    return new Promise<Array<number>>((resolve, reject) => {
        function update(content: string, relationNotes: Array<NoteRelation>) {
            // 此处更新后变为用户
            record.record.role = 'user';
            useNoteStore().update(record, content, relationNotes)
                .then(resolve).catch(reject).finally(modalReturn.close)
        }

        const el = ref<HTMLDivElement>();

        let app: App | null = null

        watch(el, value => {
            if (value && !app) {
                app = createApp({
                    render() {
                        return <TextEditor content={record.record.content} relationNotes={record.record.relationNotes}
                                           noteId={record.record.id} onSave={update}/>
                    }
                });
                app.use(ArcoVue).use(ArcoVueIcon);
                app.mount(value);
            }
        })

        const modalReturn = Modal.open({
            title: '卡片笔记',
            titleAlign: 'start',
            footer: false,
            draggable: true,
            content: () => <div ref={el} />,
            onBeforeClose() {
                app && app.unmount();
            },
        });
    })
}
