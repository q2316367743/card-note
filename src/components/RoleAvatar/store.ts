// 角色头像缓存：附件图标 => 附件url
import {defineStore} from "pinia";
import {AVATAR_PREFIX, buildDefaultRole, CUSTOMER_PREFIX, Role, USER} from "@/entity/Role";
import {myself, useRoleStore, visitorAvatar} from "@/store/RoleStore";

export const useRoleAvatarCache = defineStore('role-avatar', () => {
    const roleAvatarCache = new Map<string, Role>();

    async function getAvatar(icon: string): Promise<Role> {
        const cache = roleAvatarCache.get(icon);
        if (cache) return cache;
        if (icon === USER) {
            const avatar = myself.value.avatar;
            if (avatar.startsWith(AVATAR_PREFIX)) {
                const data = await utools.db.promises.getAttachment(avatar);
                if (data) {
                    const blob = new Blob([data]);
                    const cache = window.URL.createObjectURL(blob);
                    roleAvatarCache.set(icon, myself.value);
                    // 返回处理的
                    return {
                        ...myself.value,
                        avatar: cache
                    };
                }
            }
            return myself.value
        } else if (icon.startsWith(CUSTOMER_PREFIX) || icon.startsWith(AVATAR_PREFIX)) {
            let id = 0;
            if (icon.startsWith(CUSTOMER_PREFIX)) {
                id = parseInt(icon.replace(CUSTOMER_PREFIX, ""))
            }else if (icon.startsWith(AVATAR_PREFIX)) {
                id = parseInt(icon.replace(AVATAR_PREFIX, ""))
            }

            const {roleMap} = useRoleStore();

            const role = roleMap.get(id);

            if (role) {

                const data = await utools.db.promises.getAttachment(`${AVATAR_PREFIX}${id}`);

                const target = {
                    ...role,
                    avatar: visitorAvatar
                };
                if (data) {
                    const blob = new Blob([data]);
                    target.avatar = window.URL.createObjectURL(blob);
                }
                roleAvatarCache.set(icon, target);
                return target;
            }
        } else if (icon.startsWith("http")) {
            // 啥也不是，返回默认
            const visitor = {
                ...buildDefaultRole(),
                avatar: icon
            };
            // 默认访客图标
            roleAvatarCache.set(icon, visitor);
            return visitor;
        }


        const visitor = buildDefaultRole();
        // 默认访客图标
        roleAvatarCache.set(icon, visitor);
        return visitor;

    }

    function removeCache(icon: string) {
        const cache = roleAvatarCache.get(icon);
        if (cache) {
            if (cache.avatar.startsWith("blob")) {
                window.URL.revokeObjectURL(cache.avatar);
            }
        }
        roleAvatarCache.delete(icon);
    }

    return {getAvatar, removeCache};
})
