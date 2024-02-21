import {writeText} from '@tauri-apps/api/clipboard';
import {isPermissionGranted, requestPermission, sendNotification} from '@tauri-apps/api/notification';
import {open} from "@tauri-apps/api/shell";
import {fetch, ResponseType} from "@tauri-apps/api/http";
import {AxiosRequestConfig} from "axios";


export const utools = {
    copyText(text: string) {
        writeText(text).then(() => console.log("复制文本"));
    },
    shellOpenExternal(url: string) {
        open(url).then(() => console.log("打开链接"));
    },
    showNotification(body: string) {
        async function _show(body: string) {
            let permissionGranted = await isPermissionGranted();
            if (!permissionGranted) {
                const permission = await requestPermission();
                permissionGranted = permission === 'granted';
            }
            if (permissionGranted) {
                sendNotification({title: 'es-client', body: body});
            }
        }

        _show(body).then(() => console.log("发送通知"));
    },
    getUser() {
        return {avatar: "", nickname: localStorage.getItem("nickname") || "客户端用户", type: ""};
    },
};

export const preload = {
    axios: {
        get: async (url: string, config?: AxiosRequestConfig) => {
            const _config = config || {};
            const response = await fetch<Record<string, any>>(url, {
                method: 'GET',
                query: _config.params,
                timeout: _config.timeout || 5000,
                headers: _config.headers,
                responseType: ResponseType.JSON
            })
            return response.data
        }
    }
}
