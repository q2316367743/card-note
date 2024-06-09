import {DbStorage} from "@/plugin/utools/types";

export const webDbStorage: DbStorage = {
    /**
     * 键值对存储，如果键名存在，则更新其对应的值
     * @param key 键名(同时为文档ID)
     * @param value 键值
     */
    setItem(key: string, value: any): void {
        localStorage.setItem(key, JSON.stringify({
            value: value
        }));
    },
    /**
     * 获取键名对应的值
     */
    getItem(key: string): any {
        const value = localStorage.getItem(key);
        if (!value) {
            return null;
        }
        return JSON.parse(value).value;
    },
    /**
     * 删除键值对(删除文档)
     */
    removeItem(key: string): void {
        localStorage.removeItem(key);
    },
}

