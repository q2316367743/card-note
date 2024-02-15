/// <reference types="vite/client" />
import {AxiosInstance} from "axios";

declare global {
    interface Window {
        isUtools: boolean,
        preload: {
            axios: AxiosInstance
        }
    }
}
