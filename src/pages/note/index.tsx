import styled from 'vue3-styled-components';
import {computed, createApp, nextTick, ref, watch} from "vue";
import {toDateString} from "xe-utils";
import {Avatar, Button, ButtonGroup, Card, Empty, List, ListItem, PageHeader} from "@arco-design/web-vue";
import {useAppStore} from "@/store/AppStore";
import {NoteContent, NoteRelation} from "@/entity/Note";
import {IconEdit, IconExport, IconMessage} from "@arco-design/web-vue/es/icon";

import {createExportImage} from "@/components/CardNote/ExportImage";
import NotePreview from "@/components/CardNote/NotePreview.vue";
import TextEditor from '@/components/TextEditor/index.vue';
import {useNoteStore, useRefreshNoteEvent} from "@/store/NoteStore";
import {DbRecord} from "@/utils/utools/DbStorageUtil";
import {openEditBox} from "@/pages/home/module/EditBox";
import MessageUtil from "@/utils/MessageUtil";
import {useAiStore} from "@/store/AiStore";
import html2canvas from "html2canvas";
import {downloadByUrl} from "@/utils/BrowserUtil";

const NoteInfo = styled.div`
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: var(--color-bg-1);
    color: var(--color-text-1);
`;

const Container = styled.div`
    position: absolute;
    top: 63px;
    left: 7px;
    right: 7px;
    bottom: 7px;
    overflow: auto;
`;

const Content = styled.div`
    margin: 0 auto;
    width: 672px;
`

const Bottom = styled.div`
    display: flex;
    justify-content: space-between;
    line-height: 32px;
    font-size: 14px;
`;

const BottomLeft = styled.div`
    display: flex;
    justify-content: flex-start;
    align-content: center;
    flex-direction: row;
    line-height: 32px;
    height: 32px;
    font-size: .875rem;
`;


export function openNoteInfo(record: DbRecord<NoteContent>, update: (needUpdateIds: Array<number>) => void) {

    try {
        LA.track('note_info');
    } catch (e) {
        console.error(e);
    }

    const noteContent = ref(record.record);
    const commentNotes = ref<Array<NoteContent>>(new Array<NoteContent>());
    const sharing = ref(false);
    const shareElement = ref<any>();

    const divElement = document.createElement("div");
    const user = utools.getUser();

    function close() {
        // 组件取消挂载
        app.unmount();
        // 销毁元素
        divElement.remove();
    }

    function onUpdate(record: DbRecord<NoteContent>) {
        openEditBox(record)
            .then(needUpdateIds => {
                MessageUtil.success("更新成功")
                // 更新列表
                update(needUpdateIds);
                // 更新自身数据
                useNoteStore().getOne(noteContent.value.id)
                    .then(res => {
                        if (res) {
                            noteContent.value = res.record;
                            record.record = res.record;
                            record.rev = res.rev;
                        }
                    });
            }).catch(e => MessageUtil.error("更新失败", e))
    }

    function onSave(content: string, relationNotes: Array<NoteRelation>) {
        if (!content) {
            MessageUtil.warning("请输入内容");
            return;
        }
        relationNotes = [
            ...relationNotes,
            {
                noteId: 0,
                relationId: noteContent.value.id,
                type: 'COMMENT'
            }
        ];
        useNoteStore().add(content, relationNotes)
            .then(content => {
                MessageUtil.success("新增成功");
                // 更新自身数据
                useNoteStore().getOne(noteContent.value.id)
                    .then(res => {
                        if (res) {
                            noteContent.value = res.record;
                            record.record = res.record;
                            record.rev = res.rev;
                        }
                    });
                useRefreshNoteEvent.emit();
                useAiStore().askByComment(noteContent.value.content, {record: content})
                    .then(() => {
                        // 更新这个评论
                        for (let i = 0; i < commentNotes.value.length; i++) {
                            let commentNote = commentNotes.value[i];
                            if (commentNote.id === content.id) {
                                // 重新获取
                                useNoteStore().getOne(commentNote.id)
                                    .then(res => {
                                        if (res) {
                                            commentNotes.value[i] = res.record;
                                        }
                                    })
                            }
                        }
                    })
            })
            .catch(e => MessageUtil.error("新增失败", e));
    }


    // 处理评论
    const commentIds = computed(() => noteContent.value.relationNotes
        .filter(item => item.type === 'COMMENT' && item.relationId === noteContent.value.id)
        .map(item => item.noteId));

    watch(() => commentIds.value, value => {
        commentNotes.value = [];
        useNoteStore().getMany(value)
            .then(items => commentNotes.value = items.map(item => item.record));
    }, {immediate: true})

    function share() {
        // html2canvas()
        sharing.value = true;
        nextTick(() => {
            if (!shareElement.value) {
                return;
            }
            html2canvas(shareElement.value.$el as HTMLElement, {
                backgroundColor: useAppStore().isDarkColors() ? '#2A2A2B' : '#ffffff',
                useCORS: true,
                allowTaint: true
            }).then(canvas => {
                downloadByUrl(canvas.toDataURL(), "分享详情.png");
                sharing.value = false;
            })
        })
    }

    const app = createApp({
        render: () => <NoteInfo>
            <PageHeader title="卡片笔记" subtitle={toDateString(noteContent.value.id)} onBack={close}>
                {{
                    extra: () => <Button type={'text'} onClick={share}>
                        分享
                    </Button>
                }}
            </PageHeader>
            <Container>
                <Content ref={shareElement}>
                    <Card class="card no-padding" style={{margin: '0'}}>
                        <NotePreview content={noteContent.value} ellipsis={false}/>
                    </Card>
                    <Card style="margin-top: 7px;">
                        <Bottom>
                            <BottomLeft>
                                <span style={{color: 'var(--color-neutral-8)'}}>#{noteContent.value.id}</span>
                                <div style={{marginTop: '4px'}}>
                                    <svg xmlns="http://www.w3.org/2000/svg" width="24"
                                         height="24" viewBox="0 0 24 24"
                                         fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"
                                         stroke-linejoin="round" class="w-4 h-auto text-gray-400 dark:text-zinc-400">
                                        <circle cx="12.1" cy="12.1" r="1"></circle>
                                    </svg>
                                </div>
                                {user && <div>
                                    <Avatar imageUrl={user.avatar} size={20}/>
                                </div>}
                                {user && <span style={{marginLeft: '4px'}}>{user.nickname}</span>}
                            </BottomLeft>
                            <ButtonGroup type={"text"}>
                                <Button onClick={() => onUpdate(record)}>
                                    {{
                                        icon: () => <IconEdit/>
                                    }}
                                </Button>
                                <Button onClick={() => createExportImage(noteContent.value)}>
                                    {{
                                        icon: () => <IconExport/>
                                    }}
                                </Button>
                            </ButtonGroup>
                        </Bottom>
                    </Card>
                    <Card style="margin-top: 7px;">
                        {commentNotes.value.length > 0 && <div style={{marginBottom: '14px'}}>
                            <IconMessage/> 评论 ({commentNotes.value.length})
                        </div>}
                        <List style="margin: 7px 0;">
                            {{
                                default: () => commentNotes.value.map(note => <ListItem>
                                    <NotePreview content={note} commentId={noteContent.value.id}/>
                                </ListItem>),
                                empty: () => <Empty>暂无评论</Empty>
                            }}
                        </List>
                        {sharing.value ? <></> : <TextEditor noteId={noteContent.value.id} onSave={onSave} ai/>}
                    </Card>
                </Content>
            </Container>
        </NoteInfo>,
        provide: {
            theme: useAppStore().dark ? 'dark' : 'light'
        }
    });
    app.mount(divElement);

    document.body.append(divElement);

}
