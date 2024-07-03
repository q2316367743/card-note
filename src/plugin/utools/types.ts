// 模拟utools声明

export type ShowOpenDialogOptionProperty = 'openFile' | 'openDirectory' | 'multiSelections' | 'showHiddenFiles'
    | 'createDirectory' | 'promptToCreate' | 'noResolveAliases' | 'treatPackageAsDirectory' | 'dontAddToRecent';

export interface ShowOpenDialogOptionFilter {
    name: string;
    extensions: Array<string>
}

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



export interface DbStorage {
    setItem(key: string, value: any): void;

    getItem(key: string): any;

    removeItem(key: string): void;
}


export interface DbPromise {
    /**
     * 创建/更新文档
     */
    put(doc: DbDoc): Promise<DbReturn>;

    /**
     * 获取文档
     */
    get(id: string): Promise<DbDoc | null>;

    /**
     * 删除文档
     */
    remove(doc: string | DbDoc): Promise<DbReturn>;

    /**
     * 执行该方法将会批量更新数据库文档，传入需要更改的文档对象合并成数组进行批量更新。
     */
    bulkDocs(docs: DbDoc[]): Promise<DbReturn[]>;

    /**
     * 获取所有文档 可根据文档id前缀查找
     */
    allDocs(key?: string): Promise<DbDoc[]>;

    /**
     * 存储附件到新文档
     * @param docId 文档ID
     * @param attachment 附件 buffer
     * @param type 附件类型，示例：image/png, text/plain
     */
    postAttachment(docId: string, attachment: Uint8Array, type: string): Promise<DbReturn>;

    /**
     * 获取附件
     * @param docId 文档ID
     */
    getAttachment(docId: string): Promise<Uint8Array | null>;

    /**
     * 获取附件类型
     * @param docId 文档ID
     */
    getAttachmentType(docId: string): Promise<string | null>;

    /**
     * 云端复制数据状态 (null: 未开启数据同步、0: 已完成复制、1：复制中)
     */
    replicateStateFromCloud(): Promise<null | 0 | 1>;
}
