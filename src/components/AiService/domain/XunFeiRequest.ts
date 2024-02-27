import Constant from "@/global/Constant";

/**
 * 讯飞请求
 *
 * @see https://www.xfyun.cn/doc/spark/Web.html
 */
export interface XunFeiRequest {
    header: Header;
    parameter: Parameter;
    payload: Payload;
}

interface Payload {
    message: Message;
}

interface Message {
    text: Text[];
}

interface Text {

    /**
     * system用于设置对话背景，user表示是用户的问题，assistant表示AI的回复
     *
     * @example [system,user,assistant]
     * @default user
     */
    role: string;

    /**
     * 用户和AI的对话内容
     *
     * 所有content的累计tokens需控制8192以内
     */
    content: string;
}

interface Parameter {
    chat: Chat;
}

interface Chat {

    /**
     * 指定访问的领域:
     *
     * @example general 指向V1.5版本
     * @example generalv2 指向V2版本
     * @example generalv3 指向V3版本
     * @example generalv3.5指向V3.5版本
     */
    domain: string;

    /**
     * 核采样阈值。用于决定结果随机性，取值越高随机性越强即相同的问题得到的不同答案的可能性越高
     *
     * @example (0，1]
     * @default 0.5
     */
    temperature: number;

    /**
     * 模型回答的tokens的最大长度
     *
     * @default 2048
     * @example V1.5取值为[1,4096]
     * @example V2.0、V3.0和V3.5取值为[1,8192]
     */
    max_tokens: number;
}

interface Header {

    /**
     * 应用appid，从开放平台控制台创建的应用中获取
     */
    app_id: string;

    /**
     * 每个用户的id，用于区分不同用户
     */
    uid: string;
}

export function buildXunFeiRequest(appId: string, questions: Array<string>): XunFeiRequest {
    return {
        "header": {
            "app_id": appId,
            "uid": Constant.id
        },
        "parameter": {
            "chat": {
                "domain": "generalv3.5",
                "temperature": 0.5,
                "max_tokens": 2048,
            }
        },
        "payload": {
            "message": {
                "text": questions.map(e => ({"role": "user", "content": e}))
            }
        }
    }
}
