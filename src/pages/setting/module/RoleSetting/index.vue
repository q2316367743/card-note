<template>
    <a-space style="width: 100%" direction="vertical">
        <a-card title="我自己" class="general-card">
            <a-list :bordered="false">
                <a-list-item>
                    <a-list-item-meta :title="myself.name" :description="myself.description">
                        <template #avatar>
                            <role-avatar :icon="myself.avatar"/>
                        </template>
                    </a-list-item-meta>
                    <template #actions>
                        <a-button type="text">
                            <template #icon>
                                <icon-edit/>
                            </template>
                        </a-button>
                    </template>
                </a-list-item>
            </a-list>
        </a-card>
        <a-card title="更多角色" class="general-card">
            <template #extra>
                <a-button type="primary" @click="showAddModal()">新增角色</a-button>
            </template>
            <a-list :bordered="false">
                <a-list-item v-for="role in roles" :key="role.id">
                    <a-list-item-meta :title="role.name">
                        <template #avatar>
                            <role-avatar :icon="role.avatar"/>
                        </template>
                    </a-list-item-meta>
                    <template #actions>
                        <a-button type="text">
                            <template #icon>
                                <icon-edit/>
                            </template>
                        </a-button>
                    </template>
                </a-list-item>
            </a-list>
        </a-card>
    </a-space>
</template>
<script lang="ts" setup>
import {myself, useRoleStore} from "@/store/RoleStore";
import RoleAvatar from "@/components/RoleAvatar/index.vue";
import {showAddModal} from "@/pages/setting/module/RoleSetting/modal";

const {roles} = useRoleStore();


</script>
<style scoped>

</style>
