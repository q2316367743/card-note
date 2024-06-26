export interface Role {

    /**
     * ID，创建时间
     */
    id: number;

    /**
     * 角色图标，只有两种：链接|附件
     */
    avatar: string;

    /**
     * 角色名
     */
    name: string;

    /**
     * 描述，不能超过255个字
     */
    description: string;

}

export const HTTP_PREFIX = 'http://'
export const HTTPS_PREFIX = 'https://'
export const FILE_PREFIX = 'file://'
export const AVATAR_PREFIX = '/avatar/';
export const UTOOLS_PREFIX = 'utools://';
export const ATTACHMENT_PREFIX = '/attachment/';
export const CUSTOMER_PREFIX = 'customer:';
// AI
export const ROBOT = 'robot';
// 自己
export const USER = 'user';

export const defaultHost = `${location.protocol}//${location.host}`;
export const defaultAvatar = `${defaultHost}/logo.png`;
export const visitorAvatar = `${defaultHost}/visitor.png`;

export function buildDefaultRole(): Role {
    return {id: 0, avatar: visitorAvatar, name: '访客', description: ''}
}
