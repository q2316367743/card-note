import CryptoJS from 'crypto-js';

/**
 * 构建访问URL
 * @param apiKey
 * @param apiSecret
 */
export function buildUrl(apiKey: string, apiSecret: string): string {
    const url = 'wss://spark-api.xf-yun.com/v3.5/chat';
    const host = window.location.host;
    // @ts-ignore
    const date = new Date().toGMTString();
    const algorithm = 'hmac-sha256';
    const headers = 'host date request-line';
    const signatureOrigin = `host: ${host}\ndate: ${date}\nGET /v3.5/chat HTTP/1.1`;
    const signatureSha = CryptoJS.HmacSHA256(signatureOrigin, apiSecret);
    const signature = CryptoJS.enc.Base64.stringify(signatureSha);
    const authorizationOrigin = `api_key="${apiKey}", algorithm="${algorithm}", headers="${headers}", signature="${signature}"`;
    const authorization = window.btoa(authorizationOrigin);
    return `${url}?authorization=${authorization}&date=${date}&host=${host}`;
}


