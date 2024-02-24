import MessageUtil from '@/utils/MessageUtil';
import {generateUUID} from "@/utils/BrowserUtil";
import {del, get, getMany, keys, set, createStore, values} from 'idb-keyval';
import Constant from "@/global/Constant";
import axios from "axios";

const store = createStore("utools", Constant.id);

// 模拟utools声明

export interface DbDoc {
    _id: string,
    _rev?: string,

    [key: string]: any
}

export interface DbReturn {
    id: string,
    rev?: string,
    ok?: boolean,
    error?: boolean,
    name?: string,
    message?: string
}

export type ShowOpenDialogOptionProperty = 'openFile' | 'openDirectory' | 'multiSelections' | 'showHiddenFiles'
    | 'createDirectory' | 'promptToCreate' | 'noResolveAliases' | 'treatPackageAsDirectory' | 'dontAddToRecent';

export interface ShowOpenDialogOptionFilter {
    name: string;
    extensions: Array<string>
}

export type RedirectPreloadType = 'text' | 'img' | 'files';

export interface RedirectPreload {
    type: RedirectPreloadType;
    data: any;
}

export interface ShowOpenDialogOption {
    title?: string,
    defaultPath?: string,
    buttonLabel?: string,
    filters?: Array<ShowOpenDialogOptionFilter>,
    properties?: Array<ShowOpenDialogOptionProperty>,
    message?: string,
    securityScopedBookmarks?: boolean
}

function isMacOS(): boolean {
    return /macintosh|mac os x/i.test(navigator.userAgent);
}

function isWindows(): boolean {
    let agent = navigator.userAgent.toLowerCase();
    return agent.indexOf("win") >= 0 || agent.indexOf("wow") >= 0;
}

export const utools = {
    db: {
        promises: {
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
            get(id: string): Promise<DbDoc | undefined> {
                return get(id, store)
            },
            /**
             * 删除文档
             */
            async remove(id: string): Promise<DbReturn> {
                try {
                    await del(id, store);
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
             * @param attachment 附件 buffer
             * @param type 附件类型，示例：image/png, text/plain
             */
            async postAttachment(docId: string, attachment: Uint8Array, type: string): Promise<DbReturn> {
                await set(docId, attachment, store);
                return Promise.resolve({
                    id: docId,
                    rev: ''
                });
            },

            /**
             * 获取附件
             * @param docId 文档ID
             */
            async getAttachment(docId: string): Promise<Uint8Array | null> {
                const res = await get(docId, store);
                return res ? res : null;
            },

            /**
             * 获取附件类型
             * @param docId 文档ID
             */
            getAttachmentType(docId: string): Promise<string | null> {
                return Promise.resolve(null);
            },
        }
    },

    dbStorage: {
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
    },
    getPath(): string {
        return '';
    },
    shellOpenExternal(url: string): void {
        window.open(url);
    },
    redirect(label: string | string[], payload: string | RedirectPreload) {
        if (typeof label === 'string' || typeof payload !== 'string') {
            MessageUtil.warning("web环境不支持utools");
            window.open("https://u.tools");
        } else {
            window.open(`utools://${label[0]}/${label[1]}?${payload}`)
        }
    },
    setFeature() {
        MessageUtil.warning("web环境不支持设置feature，请使用utools版本");
    },
    isDarkColors(): boolean {
        return window.matchMedia('(prefers-color-scheme: dark)').matches;
    },
    onPluginEnter(callback: (action: { code: string, type: string, payload: any }) => void): void {
        document.addEventListener('load', () => callback({code: 'application', type: '', payload: {}}));
    },
    showOpenDialog(options: ShowOpenDialogOption): (string[]) | (undefined) {
        MessageUtil.warning("web环境不支持打开文件操作，请使用utools版本");
        return [];
    },
    setSubInput(action: { text: string }): boolean {
        console.warn("web环境不支持子输入框事件");
        return true
    },
    setSubInputValue() {
        console.warn("web环境不支持子输入框事件");
    },
    fetchUserPayments(): Promise<any[]> {
        return Promise.resolve([]);
    },
    getUser() {
        return {avatar: "./logo.png", nickname: "web用户", type: ""};
    },
    fetchUserServerTemporaryToken(): Promise<{ token: string, expiredAt: number }> {
        let token = localStorage.getItem("token");
        if (!token) {
            token = generateUUID();
            localStorage.setItem("token", token);
        }
        return Promise.resolve({
            token,
            expiredAt: 999999999
        })
    },
    isDev(): boolean {
        return import.meta.env.DEV;
    },
    isMacOS,
    isWindows,
    isLinux(): boolean {
        return !isMacOS() && !isWindows();
    },
    copyText(text: string) {
        navigator.clipboard.writeText(text)
            .then(() => console.log("复制成功"))
            .catch(e => console.error("复制失败", e));
    }

}
export const preload = {
    axios: axios.create({
        adapter: 'xhr',
        timeout: 5000
    })
}
