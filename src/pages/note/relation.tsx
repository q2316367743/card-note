import {createApp, onMounted, ref} from "vue";
import {Drawer, PageHeader} from "@arco-design/web-vue";
import styled from "vue3-styled-components";
import RelationGraph from 'relation-graph/vue3'
import type {RGJsonData, RGNode, RGOptions} from "relation-graph/types/types";
import {DbRecord} from "@/utils/utools/DbStorageUtil";
import {NoteContent, NoteRelation} from "@/entity/Note";
import MessageBoxUtil from "@/utils/MessageBoxUtil";
import MessageUtil from "@/utils/MessageUtil";
import {useNoteStore} from "@/store/NoteStore";
import {renderContent} from "@/utils/BrowserUtil";
import {toDateString} from "xe-utils";
import NotePreview from "@/components/CardNote/NotePreview.vue";


const NoteRelationInfo = styled.div`
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: var(--color-bg-1);
    color: var(--color-text-1);
`;

const Container = styled.div`
    position: absolute;
    top: 63px;
    left: 7px;
    right: 7px;
    bottom: 7px;
    overflow: auto;
`;

type RelationGraphInstance = InstanceType<typeof RelationGraph>;

export function openNoteRelation(record: DbRecord<NoteContent>) {

    if (!record.record.relationNotes.length) {
        return;
    }

    const loading = MessageBoxUtil.loading("正在获取关联关系");

    getAllContent(record.record)
        .then(res => createPage(buildData(record.record, res), res))
        .catch(e => MessageUtil.error("获取关联关系失败", e))
        .finally(loading.close);


}

async function getAllContent(record: NoteContent): Promise<Map<number, NoteContent>> {
    const itemMap = new Map<number, NoteContent>();
    await build(record, itemMap);
    return itemMap;
}

async function build(record: NoteContent, itemMap: Map<number, NoteContent>) {
    for (let relationNote of record.relationNotes) {
        if (!itemMap.has(relationNote.noteId)) {
            const temp = await useNoteStore().getOne(relationNote.noteId);
            if (temp) {
                itemMap.set(temp.record.id, temp.record);
                await build(temp.record, itemMap);
            }
        } else if (!itemMap.has(relationNote.relationId)) {
            const temp = await useNoteStore().getOne(relationNote.relationId);
            if (temp) {
                itemMap.set(temp.record.id, temp.record);
                await build(temp.record, itemMap);
            }

        }
    }
}

function buildRelationNoteKey(relation: NoteRelation): string {
    return `${relation.noteId}-${relation.relationId}-${relation.type}`;
}

function buildData(root: NoteContent, itemMap: Map<number, NoteContent>): RGJsonData {
    const records = Array.from(itemMap.values());
    const relationSet = new Set<string>();
    const relations = new Array<NoteRelation>();
    for (let record of records) {
        for (let relationNote of record.relationNotes) {
            const key = buildRelationNoteKey(relationNote);
            if (!relationSet.has(key)) {
                relations.push(relationNote);
                relationSet.add(key);
            }
        }
    }

    let index = 1;
    const getIndex = () => {
        index += 1;
        return index + '';
    };

    return {
        rootId: root.id + '',
        nodes: records.map(e => ({
            id: e.id + '',
            text: renderContent(e.content),
        })),
        lines: relations.map(e => ({
            id: getIndex(),
            from: e.noteId + '',
            to: e.relationId + ''
        }))
    }

}

function createPage(data: RGJsonData, itemMap: Map<number, NoteContent>) {
    const divElement = document.createElement("div");


    const options: RGOptions = {
        defaultExpandHolderPosition: 'right',
        backgroundColor: 'var(--color-fill-2)',
    }


    function close() {
        // 组件取消挂载
        app.unmount();
        // 销毁元素
        divElement.remove();
    }


    const app = createApp({
        setup() {

            const relationGraphRef = ref<RelationGraphInstance | null>(null);


            onMounted(() => {
                if (!relationGraphRef.value) {
                    return;
                }
                relationGraphRef.value.setJsonData(data);
            })

            return () => <NoteRelationInfo>
                <PageHeader title="关联图" subtitle="卡片笔记" onBack={close}/>
                <Container>
                    <RelationGraph options={options} ref={relationGraphRef} onNodeClick={e => onShow(e, itemMap)}/>
                </Container>
            </NoteRelationInfo>;
        }
    });


    app.mount(divElement);

    document.body.append(divElement);

}

function onShow(node: RGNode, itemMap: Map<number, NoteContent>): boolean {
    const note = itemMap.get(parseInt(node.id));
    if (!note) {
        return true;
    }
    Drawer.open({
        title: toDateString(note.id),
        width: 700,
        footer: false,
        content: () => <NotePreview content={note} ellipsis={false} relation={false}/>
    })
    return true;
}
