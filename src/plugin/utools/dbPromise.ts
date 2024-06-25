import {DbDoc, DbPromise} from "@/plugin/utools/types";
import Constant from "@/global/Constant";
import {openDB} from "idb";

const DB = 'db';
const ATTACHMENT = 'attachment';

const dbPromise = openDB(Constant.id, 2, {
    upgrade(db, oldVersion) {
        if (oldVersion !== 1) {
            // 只有第一个版本，才不需要创建db
            db.createObjectStore(DB);
        }
        db.createObjectStore(ATTACHMENT);
    },
});


export const webDbPromise: DbPromise = {
    /**
     * 创建/更新文档
     */
    async put(doc: DbDoc): Promise<DbReturn> {
        try {
            await (await dbPromise).put(DB, doc, doc._id)
            return Promise.resolve({
                id: doc._id,
                rev: Date.now() + ''
            });
        } catch (e) {
            return Promise.resolve({
                id: doc._id,
                error: true,
                message: `${e}`,
                ok: false
            });
        }
    },
    /**
     * 获取文档
     */
    async get(id: string): Promise<DbDoc | null> {
        const res = await (await dbPromise).get(DB, id);
        return res || null;
    },
    /**
     * 删除文档
     */
    async remove(doc: string | DbDoc): Promise<DbReturn> {
        let id = '';
        if (typeof doc === 'string') {
            id = doc;
        } else {
            id = doc._id;
        }
        try {
            await (await dbPromise).delete(DB, id);
            // 判断是否存在附件
            await (await dbPromise).delete(ATTACHMENT, id);
            return Promise.resolve({
                id,
                rev: ''
            });
        } catch (e) {
            return Promise.resolve({
                id,
                error: true,
                message: `${e}`,
                ok: false
            });
        }

    },

    /**
     * 执行该方法将会批量更新数据库文档，传入需要更改的文档对象合并成数组进行批量更新。
     */
    bulkDocs(docs: DbDoc[]): Promise<DbReturn[]> {
        return Promise.all(docs.map(this.put));
    },

    /**
     * 获取所有文档 可根据文档id前缀查找
     */
    async allDocs(key?: string | string[]): Promise<DbDoc[]> {
        const c = await dbPromise;

        if (!key) {
            return c.getAll(DB);
        }

        let keys = new Array<IDBValidKey>();

        if (typeof key === 'string') {
            let itemKeys = await (await dbPromise).getAllKeys(DB);
            keys = itemKeys.filter(itemKey => {
                if (typeof itemKey === 'string') {
                    return itemKey.startsWith(key)
                }
                return false;
            })
        } else {
            keys = key;
        }

        const results = new Array<DbDoc>()
        let items = await Promise.all(keys.map(id => c.get(DB, id)));
        items.forEach(e => e && results.push(e));
        return results;
    },

    /**
     * 存储附件到新文档
     * @param docId 文档ID
     * @param buffer 附件 buffer
     * @param type 附件类型，示例：image/png, text/plain
     */
    async postAttachment(docId: string, buffer: Uint8Array, type: string): Promise<DbReturn> {
        await (await dbPromise).put(DB, {
            _id: docId,
            _attachment: {
                contentType: type,
                length: buffer.length,
            }
        }, docId);
        try {
            await (await dbPromise).put(ATTACHMENT, buffer, docId);
        } catch (e) {
            // 错误，删除
            console.error(e)
            await (await dbPromise).delete(DB, docId);
            return Promise.resolve({
                id: docId,
                error: true,
                message: `${e}`,
                ok: false
            });
        }
        return Promise.resolve({
            id: docId,
            rev: '',
            error: false,
            ok: true
        });
    },

    /**
     * 获取附件
     * @param docId 文档ID
     */
    async getAttachment(docId: string): Promise<Uint8Array | null> {
        const res = await (await dbPromise).get(DB, docId);
        if (!res) {
            return null;
        }
        const buffer = await (await dbPromise).get(ATTACHMENT, docId);
        return buffer || null;
    },

    /**
     * 获取附件类型
     * @param docId 文档ID
     */
    async getAttachmentType(docId: string): Promise<string | null> {
        const res = await (await dbPromise).get(DB, docId);
        if (!res) {
            return null;
        }
        const attachment = res['_attachment'];
        return attachment ? (attachment['contentType'] || null) : null;
    },
    replicateStateFromCloud(): Promise<null | 0 | 1> {
        return Promise.resolve(null);
    }
}
