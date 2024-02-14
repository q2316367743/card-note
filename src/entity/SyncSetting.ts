export interface SyncSetting {

    /**
     * 链接
     */
    url: string;

    /**
     * 用户名
     */
    username: string;

    /**
     * 密码
     */
    password: string;

    /**
     * 自动同步
     */
    autoSync: boolean;

    /**
     * 空闲时全量同步
     */
    idleSync: boolean;

}

export function getDefaultSyncSetting(): SyncSetting {
    return {
        url: "",
        username: "",
        password: "",
        autoSync: true,
        idleSync: true,
    };
}
