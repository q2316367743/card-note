<template>
    <div>
        <markdown-editor v-model="content" @save="add()" v-if="mdEditorEnable"/>
        <TextareaEditor v-model="content" v-else ref="editor"/>
        <a-typography-paragraph v-if="relationNotes.length > 0">
            <div v-for="(relationNote, index) in relationNotes" style="margin-top: 4px;" :key="relationNote.id">
                <a-tag color="arcoblue" bordered closable @close="removeRelationNote(index)">
                    <template #icon>
                        <icon-link/>
                    </template>
                    · #{{ relationNote.id }} {{ renderContent(relationNote.content) }}
                </a-tag>
            </div>
        </a-typography-paragraph>
        <div style="display: flex;justify-content: space-between;margin-top: 7px;">
            <a-button-group type="text">
                <a-space>
                    <a-tooltip content="引用">
                        <a-button @click="openAddRelation()">
                            <template #icon>
                                <icon-link :size="16"/>
                            </template>
                        </a-button>
                    </a-tooltip>
                    <a-tooltip content="问问AI" v-if="showAskAi">
                        <a-button @click="appendAskAi()">
                            <template #icon>
                                <icon-robot :size="16"/>
                            </template>
                        </a-button>
                    </a-tooltip>
                    <a-tooltip content="待办" v-if="!mdEditorEnable">
                        <a-button @click="addCheckbox()">
                            <template #icon>
                                <icon-check-square :size="16"/>
                            </template>
                        </a-button>
                    </a-tooltip>
                    <a-tooltip content="表格" v-if="!mdEditorEnable">
                        <a-button @click="addTable()">
                            <template #icon>
                                <icon-nav :size="16"/>
                            </template>
                        </a-button>
                    </a-tooltip>
                    <a-button @click="addCode()" v-if="!mdEditorEnable">
                        <template #icon>
                            <icon-code :size="16"/>
                        </template>
                    </a-button>
                </a-space>
            </a-button-group>
            <a-space>
                <a-button type="primary" @click="add()">保存</a-button>
            </a-space>
        </div>
        <a-modal v-model:visible="visible" title="新增引用" title-align="start" draggable width="472px" @ok="onOk()">
            <a-input-group>
                <a-input v-model="relationId" style="width: 400px" placeholder="请输入笔记ID，例如 1"/>
                <a-button type="text" :disabled="!relationId" @click="addTempRelationNote()">
                    <template #icon>
                        <icon-check/>
                    </template>
                </a-button>
            </a-input-group>
            <a-typography-paragraph v-if="relationTempNotes.length > 0">
                <div v-for="(relationNote, index) in relationTempNotes" style="margin-top: 4px;" :key="relationNote.id">
                    <a-tag color="arcoblue" bordered closable @close="removeRelationTempNote(index)">
                        <template #icon>
                            <icon-link/>
                        </template>
                        · #{{ relationNote.id }} {{ renderContent(relationNote.content) }}
                    </a-tag>
                </div>
            </a-typography-paragraph>
        </a-modal>
    </div>
</template>
<script lang="ts" setup>
import {computed, ref} from "vue";

import {NoteContent, NoteRelation} from "@/entity/Note";
import {renderContent} from "@/utils/lang/BrowserUtil";
import {isNumber} from "xe-utils";
import {useNoteStore} from "@/store/NoteStore";
import MarkdownEditor from "@/components/TextEditor/MarkdownEditor.vue";
import TextareaEditor from "@/components/TextEditor/TextareaEditor.vue";
import {mdEditorEnable} from "@/store/AppStore";
import {AI_ASSISTANT, useAiStore} from "@/store/AiStore";

const props = defineProps({
    content: String,
    relationNotes: {
        type: Array<NoteRelation>,
        default: [],
        required: false
    },
    noteId: {
        type: Number,
        required: false,
        default: 0
    },
    allowRole: {
        type: Boolean,
        default: true
    }
});

const emits = defineEmits(['save']);

const content = ref(props.content || '');
const relationNotes = ref<Array<NoteContent>>([]);
const editor = ref();

const showAskAi = computed(() => !useAiStore().disabled);

if (props.relationNotes) {
    useNoteStore().getMany(props.relationNotes
        .filter(e => e.relationId !== props.noteId && e.type === 'REFERENCE')
        .map(e => e.relationId))
        .then(items => relationNotes.value = items.map(item => item.record));
}

const visible = ref(false);
const relationId = ref("");
const relationTempNotes = ref<Array<NoteContent>>([]);
const loading = ref(false);
const role = ref('user');

const addCheckbox = () => editor.value && editor.value.addCheckbox();
const addCode = () => editor.value && editor.value.addCode();
const addTable = () => editor.value && editor.value.addTable();

function openAddRelation() {
    visible.value = true;
    relationId.value = "";
    relationTempNotes.value = [];
}

function appendAskAi() {
    if (content.value.startsWith(AI_ASSISTANT)) {
        let temp = content.value.substring(AI_ASSISTANT.length);
        if (temp.startsWith(" ")) {
            temp = temp.substring(1);
        }
        content.value = temp;
    } else {
        content.value = AI_ASSISTANT + ' ' + content.value;
    }
}

function onOk() {
    relationTempNotes.value.forEach(e => relationNotes.value.push(e));
}

function addTempRelationNote() {
    if (!relationId.value) {
        return;
    }
    const id = parseInt(relationId.value);
    if (isNumber(id)) {
        loading.value = true;
        useNoteStore().getOne(id)
            .then(res => {
                if (res) {
                    relationTempNotes.value.push(res.record);
                    relationId.value = "";
                }
            })
            .finally(() => loading.value = false)
    }
}

function removeRelationNote(index: number) {
    relationNotes.value.splice(index, 1);
}

function removeRelationTempNote(index: number) {
    relationTempNotes.value.splice(index, 1);
}

function add() {
    emits('save', {
        content: content.value,
        relationNotes: Array.from(new Set(relationNotes.value.map(e => e.id))).map(e => ({
            noteId: 0,
            type: 'REFERENCE',
            relationId: e
        } as NoteRelation)),
        role: role.value
    });
    content.value = "";
    relationNotes.value = [];
}


</script>
<style scoped>
</style>
