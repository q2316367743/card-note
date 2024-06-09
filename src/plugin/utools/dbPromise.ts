import {DbPromise} from "@/plugin/utools/types";
import {del, get, getMany, keys, set, values} from "idb-keyval";
import {attachment, store} from "@/plugin/utools";

export const webDbPromise: DbPromise = {
    /**
     * 创建/更新文档
     */
    async put(doc: DbDoc): Promise<DbReturn> {
        try {
            await set(doc._id, doc, store)
            return Promise.resolve({
                id: doc._id,
                rev: ''
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
        const res = await get(id, store);
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
            await del(id, store);
            // 判断是否存在附件
            await del(id, attachment)
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
        if (key && key instanceof Array) {
            return getMany(key, store);
        } else if (key && typeof key === 'string') {
            let itemKeys = await keys(store);
            itemKeys = itemKeys.filter(itemKey => {
                if (typeof itemKey === 'string') {
                    return itemKey.startsWith(key)
                }
                return false;
            })
            return getMany(itemKeys, store);
        }
        return values(store);
    },

    /**
     * 存储附件到新文档
     * @param docId 文档ID
     * @param buffer 附件 buffer
     * @param type 附件类型，示例：image/png, text/plain
     */
    async postAttachment(docId: string, buffer: Uint8Array, type: string): Promise<DbReturn> {
        await set(docId, {
            _id: docId,
            _attachment: {
                contentType: type,
                length: buffer.length,
            }
        }, store);
        try {
            await set(docId, buffer, attachment);
        } catch (e) {
            // 错误，删除
            await del(docId, store);
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
        const res = await get(docId, store);
        if (!res) {
            return null;
        }
        const buffer = await get(docId, attachment);
        return buffer || null;
    },

    /**
     * 获取附件类型
     * @param docId 文档ID
     */
    async getAttachmentType(docId: string): Promise<string | null> {
        const res = await get(docId, store);
        if (!res) {
            return null;
        }
        const attachment = res['_attachment'];
        return attachment ? (attachment['contentType'] || null): null;
    },
    replicateStateFromCloud(): Promise<null | 0 | 1> {
        return Promise.resolve(null);
    }
}
