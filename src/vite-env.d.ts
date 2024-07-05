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

interface UmamiProps {
    hostname?: string;
    language?: string;
    referrer?: string;
    screen?: string;
    title?: string;
    url?: string;
    website: string;
}

interface UmamiPropData extends UmamiProps {
    name?: string;
    data?: Record<string, string | number | boolean>;
}

interface UmamiInstance {

    track(event: string, data?: Record<string, string | number | boolean>): void;

    track(data: UmamiProps): void;

    track(func: (props: Required<UmamiProps>) => UmamiPropData): void;

}

declare const umami: UmamiInstance
