<template>
    <div class="card">
        <div class="label">全部标签</div>
        <div class="action">
            <a-button type="text" @click="openAdd()">
                <template #icon>
                    <icon-plus/>
                </template>
            </a-button>
        </div>
        <div class="content">
            <a-tree block-node default-expand-all :data="nodes" :virtual-list-props="{height: 250}">
                <template #extra="nodeData">
                    <a-popconfirm content="确定要删除该标签吗？" :ok-button-props="{status: 'danger'}" ok-text="删除"
                                  @ok="openRemove(nodeData)">
                        <a-button type="text" status="danger">
                            <template #icon>
                                <icon-delete/>
                            </template>
                        </a-button>
                    </a-popconfirm>
                </template>

            </a-tree>
        </div>
    </div>
</template>
<script lang="ts" setup>
import {computed} from "vue";
import {useTagStore} from "@/store/TagStore";
import {renderTagTree} from "@/pages/statistics/func/date";
import MessageBoxUtil from "@/utils/MessageBoxUtil";
import MessageUtil from "@/utils/MessageUtil";
import {TreeNodeData} from "@arco-design/web-vue";

const nodes = computed(() => renderTagTree(Array.from(useTagStore().tags)));

function openAdd() {
    MessageBoxUtil.prompt("请输入标签名称", "添加标签", {
        confirmButtonText: "新增",
        cancelButtonText: "取消",
    }).then(tag => {
        useTagStore().add([tag])
            .then(() => MessageUtil.success("新增成功"))
            .catch(e => MessageUtil.error("新增失败", e));
    })
}

function openRemove(nodeData: TreeNodeData) {
    const tag = nodeData.key as string;
    useTagStore().remove(tag)
        .then(() => MessageUtil.success("删除成功"))
        .catch(e => MessageUtil.error("删除失败", e));
}</script>
<style scoped>

</style>
