import {defineStore} from "pinia";
import {AVATAR_PREFIX, CUSTOMER_PREFIX, Role, USER} from "@/entity/Role";
import {useUtoolsDbStorage} from "@/hooks/UtoolsDbStorage";
import DbKeyEnum from "@/enumeration/DbKeyEnum";
import {computed, ref} from "vue";
import {SelectOptionData} from "@arco-design/web-vue/es/select/interface";
import {listByAsync, saveListByAsync} from "@/utils/utools/DbStorageUtil";

export const defaultAvatar = `${location.protocol}//${location.host}/logo.png`;
export const visitorAvatar = `${location.protocol}//${location.host}/visitor.png`;

const useUser = () => utools.getUser() || {avatar: defaultAvatar, nickname: '访客', type: '1'};

const buildMyself = (): Role => {
    const user = useUser();
    return {id: -1, avatar: user.avatar, name: user.nickname, description: "这个人很懒，什么都没写。"}
}

// 角色头像缓存：附件图标 => 附件url
export const useRoleAvatarCache = defineStore('role-avatar', () => {
    const roleAvatarCache = new Map<string, string>();

    async function getAvatar(icon: string): Promise<string> {
        const cache = roleAvatarCache.get(icon);
        if (cache) return cache;
        if (icon === USER || typeof icon === 'undefined') {
            const avatar = myself.value.avatar;
            if (avatar.startsWith(AVATAR_PREFIX)) {
                const data = await utools.db.promises.getAttachment(avatar);
                if (data) {
                    const blob = new Blob([data]);
                    const cache = window.URL.createObjectURL(blob);
                    roleAvatarCache.set(icon, cache);
                    return cache;
                }
                // 默认访客图标
                roleAvatarCache.set(icon, defaultAvatar);
                return visitorAvatar;
            }
            return avatar;
        } else if (icon.startsWith(AVATAR_PREFIX)) {
            const data = await utools.db.promises.getAttachment(icon);
            if (data) {
                const blob = new Blob([data]);
                const cache = window.URL.createObjectURL(blob);
                roleAvatarCache.set(icon, cache);
                return cache;
            }
            // 默认访客图标
            roleAvatarCache.set(icon, visitorAvatar);
            return visitorAvatar;
        } else if (icon.startsWith(CUSTOMER_PREFIX)) {
            const docId = icon.replace(CUSTOMER_PREFIX, AVATAR_PREFIX);
            const data = await utools.db.promises.getAttachment(docId);
            if (data) {
                const blob = new Blob([data]);
                const cache = window.URL.createObjectURL(blob);
                roleAvatarCache.set(icon, cache);
                return cache;
            }
            // 默认访客图标
            roleAvatarCache.set(icon, visitorAvatar);
            return visitorAvatar;
        }
        roleAvatarCache.set(icon, icon);
        return icon;
    }

    function removeCache(icon: string) {
        const cache = roleAvatarCache.get(icon);
        if (cache) {
            if (cache.startsWith("blob")) {
                window.URL.revokeObjectURL(cache);
            }
        }
        roleAvatarCache.delete(icon);
    }

    return {getAvatar, removeCache};
})


export const myself = useUtoolsDbStorage(DbKeyEnum.SETTING_ROLE_MYSELF, buildMyself(), {deep: true});

export const useRoleStore = defineStore('role', () => {
    const roles = ref(new Array<Role>());
    let rev: string | undefined = undefined;

    const roleOptions = computed<Array<SelectOptionData>>(() => [{
        value: 'user',
        label: myself.value.name,
        avatar: myself.value.avatar,
        description: myself.value.description
    }, ...roles.value.map(e => ({
        label: e.name,
        value: `${CUSTOMER_PREFIX}${e.id}`,
        avatar: e.avatar,
        description: e.description
    }))]);

    async function init() {
        const res = await listByAsync(DbKeyEnum.SETTING_ROLE_CUSTOMER);
        roles.value = res.list;
        rev = res.rev;
    }

    const sync = async () => rev = await saveListByAsync(DbKeyEnum.SETTING_ROLE_CUSTOMER, roles.value, rev);

    async function add(res: Role) {
        roles.value.push(res);
        await sync();
    }

    return {
        roles, roleOptions,
        init, add
    }

})
