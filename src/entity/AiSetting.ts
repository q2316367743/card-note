export interface AiSetting {

    /**
     * AI的类型
     */
    type: AiTypeEnum;

    appId: string;

    apiSecret: string;

    apiKey: string;

    /**
     * 占位符
     */
    placeholders: Array<AiPlaceholder>;

}

export enum AiTypeEnum {

    NONE = 0,

    XUN_FEI = 1

}

export interface AiPlaceholder{

    /**
     * 标签
     * @description 用于在配置页面显示
     */
    label: string;

    /**
     * 前缀
     * @description 用于在代码中生成占位符
     */
    prefix: string;

}

export function getDefaultAiSetting(): AiSetting {
    return {
        type: AiTypeEnum.NONE,
        apiKey: '',
        apiSecret: '',
        appId: '',
        placeholders: []
    }
}
