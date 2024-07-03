import MessageUtil from '@/utils/modal/MessageUtil';
import {generateUUID} from "@/utils/lang/BrowserUtil";
import {DbPromise, DbStorage, RedirectPreload, ShowOpenDialogOption} from "@/plugin/utools/types";
import {webDbPromise} from "@/plugin/utools/dbPromise";
import {webDbStorage} from "@/plugin/utools/dbStorage";

function isMacOS(): boolean {
    return /macintosh|mac os x/i.test(navigator.userAgent);
}

function isWindows(): boolean {
    let agent = navigator.userAgent.toLowerCase();
    return agent.indexOf("win") >= 0 || agent.indexOf("wow") >= 0;
}

function getWebUser() {
    return {avatar: "./logo.png", nickname: "web用户", type: ""};
}


export const utools = {
    db: {promises: webDbPromise},

    dbStorage: webDbStorage,
    getPath(): string {
        return '';
    },
    shellOpenExternal(url: string): void {
        window.open(url);
    },
    redirect(label: string | string[], payload: string | RedirectPreload) {
        if (typeof label === 'string') {
            MessageUtil.warning("请先下载utools后使用");
            window.open(`https://u.tools/plugins/search/?t=${label}`);
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
        window.addEventListener('load', () => callback({code: 'application', type: '', payload: {}}));
    },
    onPluginOut(callback: () =>void){
        window.addEventListener('close', () => callback());
    },
    onPluginDetach() {
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
    removeSubInput() {
    },
    fetchUserPayments(): Promise<any[]> {
        return Promise.resolve([]);
    },
    getUser: getWebUser,
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

// 特殊封装
export const dbStorage: DbStorage = window.utools ? window.utools.dbStorage : webDbStorage;
export const dbPromises: DbPromise = window.utools ? window.utools.db.promises : webDbPromise;
export const getUser = window.utools ? window.utools.getUser : getWebUser;

export const isUtools = !!window.utools;

