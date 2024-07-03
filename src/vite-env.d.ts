/// <reference types="vite/client" />
interface Window {

    // 全局变量
    isUtools: boolean,

    onTagSearch(tag: string): void,

    openMessage(content: string, level: 'success' | 'warning' | 'error' = 'warning'): void;

    copyText(message: string): void;

    shellOpenExternal(url: string): void;

    preload: {
        customer: {
            checkFileExist(root: string, dir: string, file: string): boolean;
            downloadFile(root: string, dir: string, fileName: string, url: string): Promise<void>;
        },

        path: {
            join(...paths: string[]): string;
        }
    }

}

interface LAInstance {
    init(option: any): void;

    // 事件埋点
    track(event: string, properties?: any): void
}

declare const LA: LAInstance
