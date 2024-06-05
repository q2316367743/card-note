<template>
    <div>
        <Mention v-model="content" :data="options" type="textarea" :placeholder="placeholder"
                 :prefix="['#', '@']" allow-clear
                 :auto-size="{minRows: 2, maxRows: 8}" ref="textareaRef" split=" " @search="onSearch"/>
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
                <Space>
                    <Tooltip content="引用">
                        <a-button @click="openAddRelation()">
                            <template #icon>
                                <IconLink :size="16"/>
                            </template>
                        </a-button>
                    </Tooltip>
                    <Dropdown v-if="!disabledAi">
                        <a-button>
                            <template #icon>
                                <IconApps :size="16"/>
                            </template>
                        </a-button>
                        <template #content>
                            <Doption v-for="placeholder in placeholders" @click="addPlaceholder(placeholder.prefix)">
                                {{ placeholder.label }}
                            </Doption>
                        </template>
                    </Dropdown>
                    <Tooltip content="待办">
                        <a-button @click="addCheckbox()">
                            <template #icon>
                                <IconCheckSquare :size="16"/>
                            </template>
                        </a-button>
                    </Tooltip>
                    <Tooltip content="表格">
                        <a-button @click="addTable()">
                            <template #icon>
                                <IconNav :size="16"/>
                            </template>
                        </a-button>
                    </Tooltip>
                    <a-button @click="addCode()">
                        <template #icon>
                            <IconCode :size="16"/>
                        </template>
                    </a-button>
                </Space>
            </a-button-group>
            <a-button type="primary" @click="add()">保存</a-button>
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
import {computed, nextTick, ref} from "vue";

import {
    ButtonGroup as AButtonGroup,
    Button as AButton,
    Tooltip, Space, Mention,
    TypographyParagraph as ATypographyParagraph,
    Tag as ATag,
    Modal as AModal,
    InputGroup as AInputGroup,
    Input as AInput,
    Dropdown,
    Doption
} from "@arco-design/web-vue";
import {IconLink, IconCheckSquare, IconCode, IconCheck, IconNav, IconApps} from "@arco-design/web-vue/es/icon";
import {getCursorPosition} from "@/utils/DomUtil";
import {useTagStore} from "@/store/TagStore";
import {NoteContent, NoteRelation} from "@/entity/Note";
import {renderContent} from "@/utils/BrowserUtil";
import {isNumber} from "xe-utils";
import {useNoteStore} from "@/store/NoteStore";
import {useAiStore} from "@/store/AiStore";

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
    ai: {
        type: Boolean,
        required: false,
        default: false
    }
});

const emits = defineEmits(['save']);

const content = ref(props.content || '');
const relationNotes = ref<Array<NoteContent>>([]);

if (props.relationNotes) {
    useNoteStore().getMany(props.relationNotes
        .filter(e => e.relationId !== props.noteId && e.type === 'REFERENCE')
        .map(e => e.relationId))
        .then(items => relationNotes.value = items.map(item => item.record));
}

const textareaRef = ref()
const visible = ref(false);
const relationId = ref("");
const relationTempNotes = ref<Array<NoteContent>>([]);
const loading = ref(false);

const options = ref<Array<string>>([]);
const placeholders = computed(() => useAiStore().placeholders);
const disabledAi = computed(() => useAiStore().disabled);

const placeholder = computed(() => {
    if (props.ai && !disabledAi.value) {
        return '输入@向AI助手提问，例如：@AI助手 总结一下';
    }
    return '任何想法...';
})

function addCheckbox() {
    if (!textareaRef.value) {
        return;
    }
    const textarea = textareaRef.value.inputRef.$refs.textareaRef as HTMLTextAreaElement;
    const cursorPosition = getCursorPosition(textarea);
    const lines = content.value.split("\n");
    lines[Math.max(cursorPosition - 1, 0)] = `- [ ] ${lines[Math.max(cursorPosition - 1, 0)]}`;
    content.value = lines.join("\n");
    nextTick(() => {
        textarea.focus();
        const start = lines.slice(0, cursorPosition).join("\n").length
        textarea.setSelectionRange(start, start);
    })
}

function addCode() {
    if (!textareaRef.value) {
        return;
    }
    const textarea = textareaRef.value.inputRef.$refs.textareaRef as HTMLTextAreaElement;

    if (!content.value) {
        content.value = '```\n\n```';
        nextTick(() => {
            textarea.focus();
            textarea.setSelectionRange(4, 4);
        });
        return;
    }

    const cursorPosition = getCursorPosition(textarea);
    const lines = content.value.split("\n");
    lines[Math.max(cursorPosition - 1, 0)] += "\n```\n\n```";
    content.value = lines.join("\n");
    nextTick(() => {
        textarea.focus();
        const start = lines.slice(0, cursorPosition).join("\n").length - 4
        textarea.setSelectionRange(start, start);
    })
}

const TABLE_TEMPLATE = '|  |  |\n|---|---|\n|  |  |';

function addTable() {

    if (!textareaRef.value) {
        return;
    }
    const textarea = textareaRef.value.inputRef.$refs.textareaRef as HTMLTextAreaElement;

    if (!content.value) {
        content.value = TABLE_TEMPLATE;
        nextTick(() => {
            textarea.focus();
            textarea.setSelectionRange(2, 2);
        });
        return;
    }

    const cursorPosition = getCursorPosition(textarea);
    const lines = content.value.split("\n");
    lines[Math.max(cursorPosition - 1, 0)] += ('\n' + TABLE_TEMPLATE);
    content.value = lines.join("\n");
    nextTick(() => {
        textarea.focus();
        const start = lines.slice(0, cursorPosition).join("\n").length - 23
        textarea.setSelectionRange(start, start);
    })
}

function openAddRelation() {
    visible.value = true;
    relationId.value = "";
    relationTempNotes.value = [];
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
    emits('save', content.value, Array.from(new Set(relationNotes.value.map(e => e.id))).map(e => ({
        noteId: 0,
        type: 'REFERENCE',
        relationId: e
    } as NoteRelation)));
    content.value = "";
    relationNotes.value = [];
}

function addPlaceholder(prefix: string) {
    // 先判断是否存在其他的前缀
    for (let placeholder of placeholders.value) {
        if (content.value.startsWith(placeholder.prefix)) {
            content.value = content.value.substring(placeholder.prefix.length);
            break;
        }
    }
    content.value = prefix + content.value;
    nextTick(() => {
        if (!textareaRef.value) {
            return;
        }
        const textarea = textareaRef.value.inputRef.$refs.textareaRef as HTMLTextAreaElement;
        textarea.focus();
        const start = content.value.length
        textarea.setSelectionRange(start, start);
    })
}

const tags = computed(() => Array.from(useTagStore().tags));

function onSearch(value: string, prefix: string) {
    if (prefix === '#') {
        options.value = tags.value;
    } else if (prefix === '@') {
        if (useAiStore().disabled) {
            options.value = [];
        } else {
            if (props.ai) {
                options.value = ['AI助手'];
            } else {
                options.value = [];
            }
        }
    } else {
        options.value = [];
    }
}


</script>
<style scoped>
</style>
