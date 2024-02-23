/// <reference types="vite/client" />
import {AxiosInstance} from "axios";

declare global {
    interface Window {

        // 全局变量
        isUtools: boolean,
        onTagSearch(tag: string): void,
        openMessage(content: string, level: 'success' | 'warning' | 'error' = 'warning'): void;

        preload: {
            axios: AxiosInstance
        },
    }
    interface LAInstance {
        init(option: any);
        // 事件埋点
        track(event: string, properties?: any): void
    }
    declare const LA: LAInstance
}

