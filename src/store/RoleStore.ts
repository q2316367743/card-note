import {defineStore} from "pinia";
import {CUSTOMER_PREFIX, Role} from "@/entity/Role";
import {useUtoolsDbStorage} from "@/hooks/UtoolsDbStorage";
import DbKeyEnum from "@/enumeration/DbKeyEnum";
import {computed, ref} from "vue";
import {SelectOptionData} from "@arco-design/web-vue/es/select/interface";
import {listByAsync, saveListByAsync} from "@/utils/utools/DbStorageUtil";
import {map} from "@/utils/ArrayUtil";
import {useSyncEvent} from "@/store/SyncStore";

export const defaultAvatar = `${location.protocol}//${location.host}/logo.png`;
export const visitorAvatar = `${location.protocol}//${location.host}/visitor.png`;

const useUser = () => utools.getUser() || {avatar: defaultAvatar, nickname: '访客', type: '1'};

const buildMyself = (): Role => {
    const user = useUser();
    return {id: -1, avatar: user.avatar, name: user.nickname, description: "这个人很懒，什么都没写。"}
}


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

    const roleMap = computed(() => map(roles.value, 'id'));

    async function init() {
        const res = await listByAsync(DbKeyEnum.SETTING_ROLE_CUSTOMER);
        roles.value = res.list;
        rev = res.rev;
    }

    const sync = async () => rev = await saveListByAsync(DbKeyEnum.SETTING_ROLE_CUSTOMER, roles.value, rev);

    async function add(res: Role) {
        roles.value.push(res);
        await sync();

        // 自动同步事件
        useSyncEvent.emit({key: DbKeyEnum.SETTING_ROLE_CUSTOMER, type: 'put'});
    }

    return {
        roles, roleOptions, roleMap,
        init, add
    }

})
