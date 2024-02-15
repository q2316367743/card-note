import {NoteContent} from "@/entity/Note";
import {useNoteStore} from "@/store/NoteStore";

export function importFromMemos() {

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
    type: string;
}

async function _importFromMemos(url: string, token: string) {
    // https://memos-esion.tocmcc.cn/api/v1/memo?creatorUsername=admin&rowStatus=NORMAL&offset=20&limit=20
    let offset = 0;
    const limit = 20;
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
        const noteContents = new Array<NoteContent>();
        for (let item of items) {
            noteContents.push({
                content: item.content,
                top: false,
                deleted: false,
                updateTime: item.updatedTs * 1000,
                id: item.createdTs * 1000,
                relationNotes: item.relationList.map(e => e.relatedMemoId)
            })
        }

        await useNoteStore().addBatch(noteContents);

        offset += limit;


        if (items.length < limit) {
            break;
        }
    }
}
