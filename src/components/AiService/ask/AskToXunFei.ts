import {useAiStore} from "@/store/AiStore";

/**
 * 向讯飞AI发送请求
 *
 * @param questions 问题
 */
export function askToXunFei(questions: Array<string>): Promise<string> {
    return new Promise<string>(resolve => {
        const { openAi, model} = useAiStore();
        if (!openAi) {
            return Promise.reject(new Error('openai客户端不存在'));
        }
        openAi.chat.completions.create({
            messages: questions.map(e => ({
                role: 'user',
                content: e
            })),
            model: model
        }).then(res => {
            resolve(res.choices.map(e => e.message)
                .map(e => e.content).join('\n'));
        });
    })
}


