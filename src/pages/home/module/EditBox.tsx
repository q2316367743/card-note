import {DbRecord} from "@/utils/utools/DbStorageUtil";
import {NoteAdd, NoteContent} from "@/entity/Note";
import ArcoVue, {Drawer} from "@arco-design/web-vue";
import TextEditor from "@/components/TextEditor/index.vue";
import {useNoteStore} from "@/store/NoteStore";
import {createApp, ref, watch, App, computed} from "vue";
import ArcoVueIcon from "@arco-design/web-vue/es/icon";
import {useAppStore} from "@/store/AppStore";

export function openEditBox(record: DbRecord<NoteContent>): Promise<Array<number>> {
    return new Promise<Array<number>>((resolve, reject) => {
        function update(note: NoteAdd) {
            // 更新不能修改角色
            useNoteStore().update(record, note.content, note.relationNotes)
                .then(resolve).catch(reject).finally(modalReturn.close)
        }

        const el = ref<HTMLDivElement>();

        const isMobile = computed(() => useAppStore().isMobile);

        let app: App | null = null

        watch(el, value => {
            if (value && !app) {
                app = createApp({
                    render() {
                        return <TextEditor content={record.record.content} relationNotes={record.record.relationNotes}
                                           noteId={record.record.id} onSave={update} allowRole={false}/>
                    }
                });
                app.use(ArcoVue).use(ArcoVueIcon);
                app.mount(value);
            }
        });


        const modalReturn = Drawer.open({
            title: '卡片笔记',
            footer: false,
            width: isMobile.value ? '100vw' : '600px',
            content: () => <div ref={el} />,
            onBeforeClose() {
                app && app.unmount();
            },
        });
    })
}
