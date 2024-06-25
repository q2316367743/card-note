import {MD5, AES, enc, format} from 'crypto-js';

export const rootEncrypt = {
    /**
     * 加密一个值
     * @param value 输入值
     * @return 秘钥
     */
    hash(value: string): string {
        return MD5(value).toString(enc.Hex);
    },
    /**
     * 比较当前值与秘钥是否一致
     * @param value 输入值
     * @param target 秘钥
     */
    compare(value: string, target: string): boolean {
        return MD5(value).toString(enc.Hex) === target;
    }
}

interface KeyIv {
    key: string;
    iv: string;
}

function getKeyIv(passphrase: string): KeyIv {
    const hash1 = MD5(passphrase).toString(enc.Hex);
    const hash2 = MD5(hash1 + passphrase).toString(enc.Hex);
    const hash3 = MD5(hash2 + passphrase).toString(enc.Hex);
    return {key: hash2, iv: hash3.substring(16)}
}

/**
 * 加密一个值
 * @param secret 秘钥
 * @param data 数据
 * @return 加密后的值
 */
export function encryptValue(secret: string, data: string): string {
    const {key, iv} = getKeyIv(secret);
    return AES.encrypt(data, key, {
        iv: enc.Utf8.parse(iv)
    }).toString(format.Hex);
}

/**
 * 解密一个值
 * @param secret 秘钥
 * @param data 数据
 * @return {string} 解密后的值
 */
export function decryptValue(secret: string, data: string): string {
    if (!data) return ''
    const {key, iv} = getKeyIv(secret);
    return AES.decrypt(data, key, {
        iv: enc.Utf8.parse(iv)
    }).toString(enc.Hex);
}
