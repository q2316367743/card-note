export interface SyncSetting {
    
    type: 'WebDAV' | 'AList';

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

    /**
     *  空闲时全量同步的时间间隔，单位为毫秒
     */
    idleSyncInterval: number;

}

export function getDefaultSyncSetting(): SyncSetting {
    return {
        type: 'WebDAV',
        url: "",
        username: "",
        password: "",
        autoSync: false,
        idleSync: true,
        // 默认5分钟
        idleSyncInterval: 300000
    };
}
