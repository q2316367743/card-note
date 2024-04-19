export interface AiSetting {

    url: string;

    token: string;

    /**
     * 占位符
     */
    placeholders: Array<AiPlaceholder>;

    model: string

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

export function getDefaultAiPlaceholder(): AiPlaceholder {
    return {
        label: '',
        prefix: ''
    }
}

export function getDefaultAiSetting(): AiSetting {
    return {
        url: 'https://api.openai.com',
        token: '',
        placeholders: [],
        model: 'gpt-3.5-turbo'
    }
}
