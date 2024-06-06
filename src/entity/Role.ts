import {visitorAvatar} from "@/store/RoleStore";

export interface Role {

    /**
     * ID，创建时间
     */
    id: number;

    /**
     * 角色图标
     * 链接图标：http://
     * 链接图标：https://
     * 文件图标：file://
     * 附件图标：attachment://
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
export const CUSTOMER_PREFIX = 'customer:';
// AI
export const ROBOT = 'robot';
// 自己
export const USER = 'user';

export function buildDefaultRole(): Role {
    return {id: 0, avatar: visitorAvatar, name: '访客', description: ''}
}
