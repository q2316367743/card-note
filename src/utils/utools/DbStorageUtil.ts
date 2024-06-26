import {toRaw} from "vue";
import {clone} from "xe-utils";
import {visitorAvatar} from "@/entity/Role";

// 对象

export function getItem<T>(key: string): T | null {
    let value = utools.dbStorage.getItem(key);
    if (typeof value === 'undefined' || value == null) {
        return null;
    }
    return value;

}

export function getItemByDefault<T>(key: string, defaultValue: T) {
    let value = utools.dbStorage.getItem(key);
    if (typeof value === 'undefined' || value == null) {
        return defaultValue;
    }
    return value;
}

export function setItem(key: string, value: any) {
    utools.dbStorage.setItem(key, toRaw(value));
}

// --------------------------------------- 基础对象 ---------------------------------------

export interface DbList<T> {

    list: Array<T>;

    rev?: string;

}

export interface DbRecord<T> {

    record: T;

    rev?: string;

}

export interface DbListRecord<T> extends DbRecord<T>{

    id: string

}

// --------------------------------------- 列表操作 ---------------------------------------

export async function listByAsync<T = any>(key: string): Promise<DbList<T>> {
    const res = await utools.db.promises.get(key);
    if (res) {
        return {
            list: res.value,
            rev: res._rev
        };
    }
    return {list: []};
}

export async function saveListByAsync<T>(key: string, records: Array<T>, rev?: string): Promise<undefined | string> {
    const res = await utools.db.promises.put({
        _id: key,
        _rev: rev,
        value: toRaw(records)
    });
    if (res.error) {
        if (res.message === "Document update conflict") {
            // 查询后更新
            const res = await utools.db.promises.get(key);
            return await saveListByAsync(key, records, res ? res._rev : undefined);
        }
        return Promise.reject(res.message);
    }
    return Promise.resolve(res.rev);
}

export async function listRecordByAsync<T>(key?: string | string[]): Promise<Array<DbListRecord<T>>> {
    // @ts-ignore
    const items = await utools.db.promises.allDocs(key);
    return items.filter(e => !!e).map(item => ({
        record: item.value,
        rev: item._rev,
        id: item._id
    }));
}

// --------------------------------------- 单一对象操作 ---------------------------------------

export async function getFromOneByDefault<T extends Record<string, any>>(key: string, record: T): Promise<DbRecord<T>> {
    const res = await utools.db.promises.get(key);
    if (!res) {
        return {record}
    }
    return Promise.resolve({
        record: Object.assign(record, res.value),
        rev: res._rev
    });
}

export async function getFromOneByAsync<T extends Record<string, any>>(key: string): Promise<DbRecord<T> | null> {
    const res = await utools.db.promises.get(key);
    if (!res) {
        return null
    }
    return Promise.resolve({
        record: res.value,
        rev: res._rev
    });
}


/**
 * 保存一条数据
 * @param key 键
 * @param value 值
 * @param rev 恢复
 * @param err 错误处理函数
 */
export async function saveOneByAsync<T>(key: string, value: T, rev?: string, err?: (e: Error) => void): Promise<undefined | string> {
    const res = await utools.db.promises.put({
        _id: key,
        _rev: rev,
        value: toRaw(value)
    });
    if (res.error) {
        if (res.message === "Document update conflict") {
            // 查询后更新
            const res = await utools.db.promises.get(key);
            return saveOneByAsync(key, value, res ? res._rev : undefined);
        } else if (res.message === 'DataCloneError: Failed to execute \'put\' on \'IDBObjectStore\': #<Object> could not be cloned.') {
            return saveOneByAsync(key, clone(value, true), rev, err);
        }
        if (err) {
            err(new Error(res.message));
        } else {
            return Promise.reject(res.message);
        }
    }
    return Promise.resolve(res.rev);
}

/**
 * 删除一条记录
 * @param key 键
 * @param ignoreError 是否忽略异常
 */
export async function removeOneByAsync(key: string, ignoreError: boolean = false): Promise<void> {
    const res = await utools.db.promises.remove(key);
    if (res.error) {
        if (ignoreError) {
            console.error(res);
        }else {
            return Promise.reject(res.message);
        }
    }
}

// --------------------------------------- 批量操作 ---------------------------------------

/**
 * 批量删除指定key开头的文档
 * @param key ID前缀
 * @param ignoreError 是否忽略异常，默认不忽略
 */
export async function removeMultiByAsync(key: string, ignoreError: boolean = false): Promise<void> {
    const items = await utools.db.promises.allDocs(key);
    for (let item of items) {
        await removeOneByAsync(item._id, ignoreError);
    }
}


// --------------------------------------- 临时存储 ---------------------------------------

export function getStrBySession(key: string): string {
    return sessionStorage.getItem(key) || '';
}

export function setStrBySession(key: string, value: string) {
    sessionStorage.setItem(key, value);
}

// --------------------------------------- 附件 ---------------------------------------

/**
 * 上传文件
 * @param docId 文档ID
 * @param attachment 附件
 * @return 附件ID
 */
export async function postAttachment(docId: string, attachment: Blob | File): Promise<string> {
    const buffer = await attachment.arrayBuffer();
    const res = await utools.db.promises.postAttachment(docId, new Uint8Array(buffer), "application/octet-stream");
    if (res.error) {
        return Promise.reject(res.message);
    }
    return Promise.resolve(docId);
}

const attachmentUrl = new Map<string, string>();

/**
 *  获取附件
 * @param docId 附件ID
 * @return 附件链接
 */
export async function getAttachmentAsync(docId: string): Promise<string> {
    let newVar = attachmentUrl.get(docId);
    if (newVar) {
        return Promise.resolve(newVar);
    }
    const data = await utools.db.promises.getAttachment(docId);
    if (!data) {
        return Promise.resolve("./logo.png")
    }
    const blob = new Blob([data], {type: 'image/png'});
    newVar = window.URL.createObjectURL(blob);
    attachmentUrl.set(docId, newVar);
    return Promise.resolve(newVar);
}


/**
 *  异步删除附件
 * @param docId 附件ID
 * @return 附件链接
 */
export async function removeAttachmentAsync(docId: string): Promise<void> {
    const data = await utools.db.promises.remove(docId);
    attachmentUrl.delete(docId);
    if (data.error) {
        return Promise.reject(new Error(data.message));
    }
}


/**
 *  获取附件
 * @param docId 附件ID
 * @return 附件链接
 */
export function getAttachmentSync(docId: string): string {
    const data = utools.db.getAttachment(docId);
    if (!data) {
        return visitorAvatar;
    }
    const blob = new Blob([data]);
    return window.URL.createObjectURL(blob);
}
