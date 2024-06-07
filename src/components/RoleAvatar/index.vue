<template>
    <div class="role-avatar" @click="onClick">
        <!-- 机器人 -->
        <a-tooltip v-if="robot" content="AI助手">
            <a-avatar :image-url="IconChatgpt" title="AI助手">
                <icon-robot/>
            </a-avatar>
        </a-tooltip>
        <!-- 用户、自己 -->
        <a-tooltip v-else :content="role ? role.name : ''">
            <a-avatar :image-url="url" :size :title="role ? role.name : ''">
                <icon-user/>
            </a-avatar>
        </a-tooltip>
    </div>
</template>
<script lang="ts">
import {useRoleAvatarCache} from "@/components/RoleAvatar/store";
import {defineComponent, ref, watch} from "vue";
import {ROBOT, Role, USER} from "@/entity/Role";
import IconChatgpt from '@/assets/images/icon-chatgpt.png';

const {getAvatar} = useRoleAvatarCache();

export default defineComponent({
    name: 'RoleAvatar',
    props: {
        icon: {
            type: String,
            default: () => USER
        },
        size: Number
    },
    setup(props) {
        const url = ref('');
        const role = ref<Role>()
        const robot = props.icon === ROBOT;

        watch(() => props.icon, value => {
            if (robot) {
                return
            }
            getAvatar(value).then(res => {
                url.value = res.avatar;
                role.value = res;
            });
        }, {immediate: true});

        function onClick() {
            console.log('点击角色，进行角色筛选')
        }

        return {url, robot, role, IconChatgpt, onClick};
    }
})

</script>
<style scoped>
.role-avatar {
    cursor: pointer;
}
</style>
