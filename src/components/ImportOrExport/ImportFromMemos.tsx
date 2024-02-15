import {NoteContent} from "@/entity/Note";
import {useNoteStore} from "@/store/NoteStore";
import {Form, FormItem, Input, Modal} from "@arco-design/web-vue";
import {ref} from "vue";
import {fullSynchronization} from "@/components/SyncAlgorithm/IdleSync";
import {useSyncStore} from "@/store/SyncStore";
import MessageBoxUtil from "@/utils/MessageBoxUtil";
import MessageUtil from "@/utils/MessageUtil";

export function openImportFromMemos() {
    const config = ref({
        url: "",
        token: ""
    })
    Modal.open({
        title: "从Memos导入",
        draggable: true,
        okText: "导入",
        content: () => <Form model={config.value} layout={"vertical"}>
            <FormItem label="服务器地址">
                <Input v-model={config.value.url}/>
            </FormItem>
            <FormItem label="token">
                <Input v-model={config.value.token}/>
            </FormItem>
        </Form>,
        onOk: async () => {
            const loading = MessageBoxUtil.loading("正在导入，请稍候...");
            try {
                // 开始导入
                loading.append("正在导入")
                await _importFromMemos(config.value.url, config.value.token);
                // 进行一次全量同步
                loading.append("进行一次全量同步");
                let client = useSyncStore().client;
                if (client) {
                    await fullSynchronization(client, loading);
                }
                MessageUtil.success("导入成功");
            } catch (e) {
                MessageUtil.error("导入失败", e)
            } finally {
                loading.close();
            }
        }
    });
}

interface RootObject {
    id: number;
    rowStatus: string;
    creatorId: number;
    createdTs: number;
    updatedTs: number;
    displayTs: number;
    content: string;
    visibility: string;
    pinned: boolean;
    parent?: any;
    creatorName: string;
    creatorUsername: string;
    resourceList: any[];
    relationList: RelationList[];
}

interface RelationList {
    memoId: number;
    relatedMemoId: number;
    type: 'COMMENT' | 'REFERENCE';
}

async function _importFromMemos(url: string, token: string) {
    let offset = 0;
    const limit = 20;
    const noteContentMap = new Map<number, NoteContent>();
    while (true) {
        let rsp = await window.preload.axios.get<Array<RootObject>>("/api/v1/memo", {
            baseURL: url,
            params: {
                rowStatus: 'NORMAL',
                offset,
                limit
            },
            headers: {
                Cookie: `memos.access-token=${token}`
            }
        });
        const items = rsp.data;
        for (let item of items) {
            noteContentMap.set(item.id, {
                content: item.content,
                top: false,
                deleted: false,
                updateTime: item.updatedTs * 1000,
                id: item.createdTs * 1000,
                relationNotes: item.relationList.map(e => ({
                    noteId: e.memoId,
                    relationId: e.relatedMemoId,
                    type: e.type
                }))
            })
        }

        offset += limit;


        if (items.length < limit) {
            break;
        }
    }

    // 重新渲染ID
    noteContentMap.forEach(v => {
        v.relationNotes = v.relationNotes.map(relation => {
            const noteContent = noteContentMap.get(relation.noteId);
            const relationContent = noteContentMap.get(relation.relationId);
            return {
                noteId: noteContent ? noteContent.id : -1,
                relationId: relationContent ? relationContent.id : -1,
                type: relation.type
            }
        }).filter(e => e.noteId !== -1 && e.relationId !== -1);
    })

    // 批量新增
    await useNoteStore().addBatch(Array.from(noteContentMap.values()));

}
