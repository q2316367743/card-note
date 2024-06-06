export interface AiSetting {

    url: string;

    token: string;

    model: string

}

export function getDefaultAiSetting(): AiSetting {
    return {
        url: 'https://api.openai.com',
        token: '',
        model: 'gpt-3.5-turbo'
    }
}
