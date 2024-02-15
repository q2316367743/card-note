/// <reference types="vite/client" />
import {AxiosInstance} from "axios";

declare global {
    interface Window {
        preload: {
            axios: AxiosInstance
        }
    }
}
