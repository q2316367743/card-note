import {ref, Ref, shallowRef, toRaw, toValue, watch} from "vue";

export interface UseUtoolsDbOptions {
    flush?: 'pre' | 'post' | 'sync';
    deep?: boolean;
    writeDefaults?: boolean;
    shallow?: boolean;

    onError?(e: any): void;
}

export const dbStorage = {
    /**
     * 键值对存储，如果键名存在，则更新其对应的值
     * @param key 键名(同时为文档ID)
     * @param value 键值
     */
    setItem(key: string, value: any): void {
        localStorage.setItem(key, JSON.stringify({
            value: value
        }));
    },
    /**
     * 获取键名对应的值
     */
    getItem(key: string): any {
        const value = localStorage.getItem(key);
        if (!value) {
            return null;
        }
        return JSON.parse(value).value;
    },
    /**
     * 删除键值对(删除文档)
     */
    removeItem(key: string): void {
        localStorage.removeItem(key);
    },
}

/**
 * 异步对象存储
 */
export function useUtoolsDbStorage<T extends (string | number | boolean | object | null)>(
    key: string,
    initialValue: T,
    options: UseUtoolsDbOptions = {},
): Ref<T> {
    const {
        flush = 'pre',
        deep = true,
        writeDefaults = true,
        shallow,
        onError = (e) => {
            console.error(e)
        },
    } = options

    const rawInit: T = toValue(initialValue)

    const data = (shallow ? shallowRef : ref)(initialValue) as Ref<T>


    function read(event?: StorageEvent) {
        if (event && event.key !== key)
            return

        try {
            const rawValue = event ? event.newValue : utools.dbStorage.getItem(key)
            if (rawValue == null) {
                data.value = rawInit
                if (writeDefaults && rawInit !== null)
                    utools.dbStorage.setItem(key, toRaw(rawInit))
            } else {
                data.value = rawValue;
            }
        } catch (e) {
            onError(e)
        }
    }

    read()

    watch(
        data,
        async () => {
            try {
                if (data.value == null)
                    utools.dbStorage.removeItem(key)
                else
                    utools.dbStorage.setItem(key, toRaw(data.value))
            } catch (e) {
                onError(e)
            }
        },
        {
            flush,
            deep,
        },
    )

    return data as Ref<T>
}
