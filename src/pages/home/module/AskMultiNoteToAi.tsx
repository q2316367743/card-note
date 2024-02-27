import {DbRecord} from "@/utils/utools/DbStorageUtil";
import {NoteContent} from "@/entity/Note";
import {Modal, Textarea} from "@arco-design/web-vue";
import {ref} from "vue";
import {useAiStore} from "@/store/AiStore";

/**
 * 向AI询问多篇笔记
 * @param records
 */
export function askMultiNoteToAi(records: Array<DbRecord<NoteContent>>) {
    const question = ref("");
    Modal.open({
        title: "向AI询问",
        draggable: true,
        okText:"询问",
        content: () => <Textarea v-model={question.value} autoSize={{minRows: 2, maxRows: 8}}
                                 placeholder="请输入你的问题，例如：帮我将上面的内容总结一下"/>,
        onOk() {
            useAiStore().askMulti(question.value, records);
        }
    })
}
