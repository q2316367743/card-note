<template>
    <div>
        <div ref="codeEditBox" class="input-box"/>
        <div style="display: flex;justify-content: space-between;margin-top: 7px;">
            <ButtonGroup type="text">
                <Space>
                    <Button>
                        <template #icon>
                            <IconTag :size="16"/>
                        </template>
                    </Button>
                    <Tooltip content="引用">
                        <Button>
                            <template #icon>
                                <IconLink :size="16"/>
                            </template>
                        </Button>
                    </Tooltip>
                    <Button @click="addCheckbox()">
                        <template #icon>
                            <IconCheckSquare :size="16"/>
                        </template>
                    </Button>
                    <Button @click="addCode()">
                        <template #icon>
                            <IconCode :size="16"/>
                        </template>
                    </Button>
                </Space>
            </ButtonGroup>
            <Button type="primary" @click="add()">保存</Button>
        </div>
    </div>
</template>
<script lang="ts" setup>
import {onMounted, ref} from "vue";
import {utools} from "@/plugin/utools";
import * as monaco from 'monaco-editor';

import {ButtonGroup, Button, Tooltip, Space} from "@arco-design/web-vue";
import {IconTag, IconLink, IconCheckSquare, IconCode}from "@arco-design/web-vue/es/icon";

const props = defineProps({
    content: String
});

const emits = defineEmits(['save']);

const codeEditBox = ref<HTMLElement>();

let instance: monaco.editor.IStandaloneCodeEditor;

function addCheckbox() {
}

function addCode() {
}

onMounted(() => {
    instance = monaco.editor.create(codeEditBox.value!, {
        language: "markdown",
        theme: utools.isDarkColors() ? 'vs-dark' : 'vs',
        lineNumbers: 'off',
        wordWrap: 'on',
        minimap: {
            enabled: false
        },
        lineNumbersMinChars: 0,
        value: props.content
    });
});


function add() {
    emits('save', instance.getValue());
    instance && instance.setValue("");
}


</script>
<style scoped>
.input-box {
    height: 144px;
    overflow: hidden;
}
</style>
