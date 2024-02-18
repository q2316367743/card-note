export interface AiSetting {

    /**
     * AI的类型
     */
    type: AiTypeEnum;

    appId: string;

    apiSecret: string;

    apiKey: string;

}

export enum AiTypeEnum {

    NONE = 0,

    XUN_FEI = 1

}

export function getDefaultAiSetting(): AiSetting {
    return {
        type: AiTypeEnum.NONE,
        apiKey: '',
        apiSecret: '',
        appId: ''
    }
}
