<template>
    <div>
        <a-avatar v-if="robot" :image-url="IconChatgpt">
            <icon-robot/>
        </a-avatar>
        <a-avatar v-else :image-url="url" :size>
            <icon-user/>
        </a-avatar>
    </div>
</template>
<script lang="ts">
import {useRoleAvatarCache} from "@/store/RoleStore";
import {defineComponent, ref, watch} from "vue";
import {ROBOT, USER} from "@/entity/Role";
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
        const robot = props.icon === ROBOT;

        watch(() => props.icon, value => {
            if (robot) {
                return
            }
            getAvatar(value).then(res => url.value = res);
        }, {immediate: true})

        return {url, robot, IconChatgpt};
    }
})

</script>
<style scoped>

</style>
