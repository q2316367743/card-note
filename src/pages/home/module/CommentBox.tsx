import {DbRecord} from "@/utils/utools/DbStorageUtil";
import {NoteAdd, NoteContent, NoteRelation} from "@/entity/Note";
import ArcoVue, {Drawer} from "@arco-design/web-vue";
import TextEditor from "@/components/TextEditor/index.vue";
import {createApp, ref, watch, App} from "vue";
import ArcoVueIcon from "@arco-design/web-vue/es/icon";
import MessageUtil from "@/utils/MessageUtil";
import {useNoteStore, useRefreshNoteEvent} from "@/store/NoteStore";
import {useAiStore} from "@/store/AiStore";

/**
 * 打开评论对话框
 *
 * @param target 评论对象
 * @param onUpdate 当更新后
 * @return 受影响的ID
 */
export function openCommentBox(target: DbRecord<NoteContent>, onUpdate: () => void): Promise<Array<number>> {

    return new Promise<Array<number>>((resolve, reject) => {

        function onSave(note: NoteAdd) {
            const {content, relationNotes, role} = note;
            if (!content) {
                MessageUtil.warning("请输入内容");
                return;
            }
            let nowRelationNotes: Array<NoteRelation> = [
                ...relationNotes,
                {
                    noteId: 0,
                    relationId: target.record.id,
                    type: 'COMMENT'
                }
            ];
            useNoteStore().add(content, nowRelationNotes, role)
                .then(content => {
                    MessageUtil.success("新增成功");
                    // 更新自身数据
                    useNoteStore().getOne(target.record.id)
                        .then(res => {
                            if (res) {
                                resolve([res.record.id]);
                                onUpdate();
                            }
                        });
                    useAiStore().askByComment(content.content, {record: content})
                        .then(() => {
                            // 更新这个评论
                            onUpdate();
                        })
                    useRefreshNoteEvent.emit();
                })
                .catch(e => MessageUtil.error("新增失败", e));
        }


        const el = ref<HTMLDivElement>();

        let app: App | null = null

        watch(el, value => {
            if (value && !app) {
                app = createApp({
                    render() {
                        return <TextEditor onSave={onSave}/>
                    }
                });
                app.use(ArcoVue).use(ArcoVueIcon);
                app.mount(value);
            }
        })

        Drawer.open({
            title: '卡片笔记',
            footer: false,
            width: 600,
            content: () => <div ref={el}/>,
            onBeforeClose() {
                app && app.unmount();
            },
        });
    })
}
