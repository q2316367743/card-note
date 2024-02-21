/// <reference types="vite/client" />
import {AxiosInstance} from "axios";

declare global {
    interface Window {
        isUtools: boolean,

        onTagSearch(tag: string): void,

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

