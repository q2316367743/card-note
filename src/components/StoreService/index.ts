export interface StoreService {

    /**
     * 判断一个key是否存在
     */
    exist(key: string): Promise<boolean>;

    /**
     * 获取一个key的内容
     *
     * @param key 键
     * @returns 内容
     */
    get(key: string): Promise<string>;

    /**
     * 设置一个key的内容
     *
     * @param key 键
     * @param content 内容
     */
    set(key: string, content: string): Promise<boolean>;

    /**
     * 删除一个key的内容
     * @param key 键
     */
    delete(key: string): Promise<void>;

}
