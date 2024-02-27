import {computed, nextTick, ref, SetupContext} from 'vue'
import {NoteContent, NoteRelation} from "@/entity/Note";
import {
    Button,
    ButtonGroup,
    Input,
    InputGroup,
    Mention,
    Modal,
    Space,
    Tag,
    Tooltip,
    TypographyParagraph
} from "@arco-design/web-vue";
import {useNoteStore} from "@/store/NoteStore";
import {useTagStore} from "@/store/TagStore";
import {IconCheck, IconCheckSquare, IconCode, IconLink, IconNav} from "@arco-design/web-vue/es/icon";
import {renderContent} from "@/utils/BrowserUtil";
import {getCursorPosition} from "@/utils/DomUtil";
import {isNumber} from "xe-utils";

type FComponentProps = {
    content: string,
    relationNotes: Array<NoteRelation>,
    noteId: number
}

type Events = {
    save(content: string, relations: Array<NoteRelation>): void
}

export function TextEditor(
    props: FComponentProps,
    context: SetupContext<Events>
) {


    const content = ref<string>(props.content || '');
    const relationNotes = ref<Array<NoteContent>>([]);

    if (props.relationNotes) {
        useNoteStore().getMany(props.relationNotes
            .filter(e => e.relationId !== props.noteId && e.type === 'REFERENCE')
            .map(e => e.relationId))
            .then(items => relationNotes.value = items.map(item => item.record));
    }

    const textareaRef = ref()

    const tags = computed(() => Array.from(useTagStore().tags));

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
        openAddRelationModal().then(res => {
            console.log(relationNotes.value)
            relationNotes.value.push(...res);
            console.log(relationNotes.value)
        });
    }

    function removeRelationNote(index: number) {
        relationNotes.value.splice(index, 1);
    }

    function add() {
        console.log(content.value, relationNotes.value);
        context.emit('save', content.value, Array.from(new Set(relationNotes.value.map(e => e.id))).map(e => ({
            noteId: 0,
            type: 'REFERENCE',
            relationId: e
        } as NoteRelation)));
        content.value = "";
        relationNotes.value = [];
    }

    return <div>
        <Mention v-model={content.value} data={tags.value} type="textarea" prefix="#" allow-clear
                 ref={textareaRef.value} split=" "/>
        {JSON.stringify(relationNotes.value)}
        {relationNotes.value.length > 0 ? <TypographyParagraph>
            {relationNotes.value.map((relationNote, index) => <div style="margin-top: 4px;" key={relationNote.id}>
                <Tag color="arcoblue" bordered closable onClose={() => removeRelationNote(index)}>
                    {{
                        icon: () => <IconLink/>,
                        default: () => <span>· #{relationNote.id} {renderContent(relationNote.content)}</span>
                    }}

                </Tag>
            </div>)}
        </TypographyParagraph> : ''}
        <div style="display: flex;justify-content: space-between;margin-top: 7px;">
            <ButtonGroup type='text'>
                <Space>
                    <Tooltip content="引用">
                        <Button onClick={openAddRelation}>
                            {{
                                icon: () => <IconLink size={16}/>
                            }}
                        </Button>
                    </Tooltip>
                    <Tooltip content="待办">
                        <Button onClick={addCheckbox}>
                            {{
                                icon: () => <IconCheckSquare size={16}/>
                            }}
                        </Button>
                    </Tooltip>

                    <Tooltip content="表格">
                        <Button onClick={addTable}>
                            {{
                                icon: () => <IconNav size={16}/>
                            }}
                        </Button>
                    </Tooltip>
                    <Button onClick={addCode}>
                        {{
                            icon: () => <IconCode size={16}/>
                        }}
                    </Button>
                </Space>
            </ButtonGroup>
            <Button type="primary" onClick={add}>保存</Button>
        </div>
    </div>
}

function openAddRelationModal() {
    const relationId = ref("");
    const relationNotes = ref<Array<NoteContent>>([]);
    const loading = ref(false);


    function addRelationNote() {
        if (!relationId.value) {
            return;
        }
        const id = parseInt(relationId.value);
        if (isNumber(id)) {
            loading.value = true;
            useNoteStore().getOne(id)
                .then(res => {
                    if (res) {
                        relationNotes.value.push(res.record);
                        relationId.value = "";
                    }
                })
                .finally(() => loading.value = false)
        }
    }

    function removeRelationNote(index: number) {
        relationNotes.value.splice(index, 1);
    }

    return new Promise<Array<NoteContent>>(resolve => {
        Modal.open({
            title: "新增引用",
            titleAlign: "start",
            draggable: true,
            onOk: () => resolve(relationNotes.value),
            content: () => <>
                <InputGroup>
                    <Input v-model={relationId.value} style={{width: "400px"}} placeholder="请输入笔记ID，例如 1"/>
                    <Button type="text" disabled={!relationId.value} onClick={addRelationNote}>
                        {{
                            icon: () => <IconCheck/>
                        }}
                    </Button>
                </InputGroup>
                {relationNotes.value.length > 0 && <TypographyParagraph>
                    {relationNotes.value.map((relationNote, index) => <div style="margin-top: 4px;"
                                                                           key={relationNote.id}>
                        <Tag color="arcoblue" bordered closable onClose={() => removeRelationNote(index)}>
                            {{
                                icon: () => <IconLink/>,
                                default: () => <span>· #{relationNote.id} {renderContent(relationNote.content)}</span>
                            }}

                        </Tag>
                    </div>)}
                </TypographyParagraph>}
            </>
        })
    })
}


TextEditor.props = {
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
    }
}
