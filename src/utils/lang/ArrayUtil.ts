export function contains<T>(arr: T[], keyword: T): boolean {
    try {
        for (let item of arr) {
            if (item === keyword) {
                return true;
            }
        }
        return false;
    } catch (e) {
        console.error(e);
        return false;
    }
}

/**
 * 指定数组中是否包含关键字数组中任意关键字
 * @param arr 指定数组
 * @param keywords 关键字数组
 */
export function containsArray<T>(arr: T[], keywords: T[]): boolean {
    try {
        for (let item of arr) {
            for (let keyword of keywords) {
                if (item === keyword) {
                    return true;
                }
            }
        }
        return false;
    } catch (e) {
        console.error(e);
        return false;
    }
}

/**
 * 将一个数组变为map
 *
 * @param arr 数组
 * @param attrName 属性名
 * @param merge key冲突合并解决办法
 * @returns map结果
 */
export function map<T extends Record<string, any>, K extends T[A], A extends keyof T>(arr: T[], attrName: A, merge?: (item1: T, item2: T) => T): Map<K, T> {
    let result = new Map<K, T>();
    for (let item of arr) {
        const key = item[attrName];
        const old = result.get(key);
        if (old) {
            if (merge) {
                result.set(key, merge(old, item));
            } else {
                throw new Error('未设置合并方法，无法合并相同key');
            }
        } else {
            result.set(key, item);
        }
    }
    return result;
}

/**
 * 讲一个数组变为set
 * @param arr 数组
 * @param attrName 属性名
 */
export function set<T extends S[A], S extends Record<string, any>, A extends keyof S>(arr: S[], attrName: A): Set<T> {
    let result = new Set<T>();
    for (let item of arr) {
        result.add(item[attrName]);
    }
    return result;
}

/**
 * 根据指定属性名对数组进行分组
 *
 * @param arr 数据
 * @param attrName 属性名
 * @returns 分组后的结果
 */
export function group<T, K extends keyof T>(arr: T[], attrName: K): Map<T[K] | null, T[]> {
    let result = new Map<T[K] | null, T[]>();
    for (let item of arr) {
        const key = (typeof item[attrName] === 'undefined' ? null : item[attrName]);
        if (result.has(key)) {
            result.get(key)?.push(item);
        } else {
            result.set(key, [item]);
        }
    }
    return result;
}

/**
 * 根据指定的属性名进行统计数量
 *
 * @param arr 数据
 * @param attrName 属性名
 * @return 属性 -> 数量
 */
export function count<T, K extends keyof T>(arr: T[], attrName: K): Map<any, number> {
    let result = new Map<any, number>();
    for (let item of arr) {
        if (result.has(item[attrName])) {
            result.set(item[attrName], result.get(item[attrName])! + 1);
        } else {
            result.set(item[attrName], 1);
        }
    }
    return result;
}

export function size<T, K extends keyof T>(arr: Array<T>, attrName: K, value: any): number {
    try {
        let count = 0;
        for (let t of arr) {
            if (t[attrName] === value) {
                count += 1;
            }
        }
        return count;
    } catch (e) {
        console.error(e);
        return 0;
    }
}

/**
 * 反转数组
 * @param arr
 */
export function reverse<T>(arr: Array<T>): Array<T> {
    let records = new Array<T>();
    for (let i = arr.length - 1; i >= 0; i--) {
        records.push(arr[i]);
    }
    return records;
}

/**
 * 数组中是否有以关键字开头的字符
 * @param arr 数组
 * @param keyword 关键字
 * @param ignoreCase 是否忽略大小写，默认不忽略
 */
export function startWith(arr: Array<string>, keyword: string, ignoreCase: boolean = false): boolean {
    for (let item of arr) {
        if (ignoreCase) {
            if (item.toUpperCase().startsWith(keyword.toUpperCase())) {
                return true;
            }
        } else {
            if (item.startsWith(keyword)) {
                return true;
            }
        }
    }
    return false;

}

/**
 * 两个数组是否有相同的元素
 * @param arr1
 * @param arr2
 */
export function arraysHaveSameElements<T>(arr1: T[], arr2: T[]) {
    if (arr1.length !== arr2.length) {
        return false;
    }

    return arr1.every(function (element) {
        return arr2.includes(element);
    });
}
