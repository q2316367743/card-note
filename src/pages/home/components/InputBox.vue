<template>
    <a-card>
        <div id="input-box" />
        <div style="display: flex;justify-content: space-between;margin-top: 4px;">
            <a-button-group type="text">
                <a-space>
                    <a-button :loading="loading">
                        <template #icon>
                            <icon-tag :size="16"/>
                        </template>
                    </a-button>
                    <a-tooltip content="引用">
                        <a-button :loading="loading">
                            <template #icon>
                                <icon-link :size="16"/>
                            </template>
                        </a-button>
                    </a-tooltip>
                    <a-button @click="addCheckbox()" :loading="loading">
                        <template #icon>
                            <icon-check-square :size="16"/>
                        </template>
                    </a-button>
                    <a-button @click="addCode()" :loading="loading">
                        <template #icon>
                            <icon-code :size="16"/>
                        </template>
                    </a-button>
                </a-space>
            </a-button-group>
            <a-button type="primary" @click="add()" :loading="loading">保存</a-button>
        </div>
    </a-card>
</template>
<script lang="ts" setup>
import {nextTick, onMounted, ref} from "vue";
import {getCursorPosition} from "@/utils/DomUtil";
import {TextareaInstance} from "@arco-design/web-vue";
import {useNoteStore} from "@/store/NoteStore";
import MessageUtil from "@/utils/MessageUtil";
import Cherry from "cherry-markdown";

const emits = defineEmits(['refresh']);

const loading = ref(false);
let instance: Cherry | null = null;

function addCheckbox() {
}

function addCode() {
}

onMounted(() => {
    instance = new Cherry({
        id: 'input-box',
        editor: {
            theme: utools.isDarkColors() ? 'ayu-dark' : 'default',
            defaultModel: 'editOnly',
            height: '288px'
        },
        toolbars: {
            theme: utools.isDarkColors() ? 'dark' : 'light',
            showToolbar: false
        },
    });
});



function add() {
    if (!instance) {
        return;
    }
    loading.value = true;
    useNoteStore().add(instance.getValue(), [])
        .then(() => {
            MessageUtil.success("新增成功");
            emits('refresh');
            instance && instance.setValue("")
        })
        .catch(e => MessageUtil.error("新增失败", e))
        .finally(() => loading.value = false);
}


</script>
<style scoped>

</style>
