import {defineStore} from "pinia";
import {useStorage} from "@vueuse/core";
import {computed} from "vue";

interface EncryptValue {
    // 秘钥
    secret: string;
    // 密保问题
    question: string;
}
const buildEncryptValue = (): EncryptValue => ({secret: "", question: ""});

export const useEncryptStore = defineStore('encrypt', () => {
    const encryptValue = useStorage<EncryptValue>(
        '/encrypt/value', buildEncryptValue(), utools.dbStorage, {deep: true});

    const enableEncrypt = computed(() => encryptValue.value.secret.trim() !== '')


    return {enableEncrypt}
})
