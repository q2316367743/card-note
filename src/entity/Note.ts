/**
 * 一篇笔记
 */
export interface Note {

    id: number;

    /**
     * 创建时间
     */
    createTime: Date | string;

    /**
     * 更新时间
     */
    updateTime: Date | string;

    /**
     * 内容
     */
    content: string;

    /**
     * 关联笔记
     */
    relationNotes: Array<number>;

}
