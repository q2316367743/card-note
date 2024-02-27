import {AiSetting} from "@/entity/AiSetting";
import {buildUrl} from "@/components/AiService/util";
import {buildXunFeiRequest} from "@/components/AiService/domain/XunFeiRequest";
import {XunFeiResponse} from "@/components/AiService/domain/XunFeiResponse";

/**
 * 向讯飞AI发送请求
 *
 * @param questions 问题
 * @param setting 设置
 */
export function askToXunFei(questions: Array<string>, setting: AiSetting): Promise<string> {
    const url = buildUrl(setting.apiKey, setting.apiSecret);
    return new Promise<string>((resolve, reject) => {
        const socket = new WebSocket(url);

        const lines = new Array<Array<string>>()

        socket.onopen = function () {
            console.log('WebSocket 连接已建立，开始发送请求。');
            // 发送请求
            socket.send(JSON.stringify(buildXunFeiRequest(setting.appId, questions)));
        };

        socket.onmessage = function (event: MessageEvent<string>) {
            const rsp = JSON.parse(event.data) as XunFeiResponse;
            lines[rsp.payload.choices.seq] = rsp.payload.choices.text.map(e => e.content);
            if (rsp.payload.usage) {
                // 最后一次
                socket.close();
            }
        };

        socket.onclose = function (event) {
            console.log('WebSocket 连接已关闭。', event);
            resolve(lines.map(e => e.join('')).join(''));
        };

        socket.onerror = function (event) {
            console.error(event)
            reject(event);
        }
    })
}


