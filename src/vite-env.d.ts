/// <reference types="vite/client" />
import {AxiosInstance} from "axios";

declare global {
    interface Window {
        isUtools: boolean,
        onTagSearch(tag: string): void,
        preload: {
            axios: AxiosInstance
        }
    }
}
