import styled from 'vue3-styled-components';
import {App, computed, createApp, nextTick, ref, watch} from "vue";
import {toDateString} from "xe-utils";
import ArcoVue, {
    Avatar,
    Button,
    ButtonGroup,
    Card, Drawer,
    Empty,
    List,
    ListItem,
    PageHeader,
    Tooltip
} from "@arco-design/web-vue";
import {detach, useAppStore} from "@/store/AppStore";
import {NoteContent, NoteRelation} from "@/entity/Note";
import ArcoVueIcon, {IconEdit, IconExport, IconMessage, IconPlus} from "@arco-design/web-vue/es/icon";

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
import {openCommentBox} from "@/pages/home/module/CommentBox";

const NoteInfo = styled.div`
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    color: var(--color-text-1);
`;

const Container = styled.div`
    position: absolute;
    top: 63px;
    left: 0;
    right: 0;
    bottom: 0;
    overflow: auto;
    padding: 7px;
`;

const Content = styled.div`
    margin: 0 auto;
    width: 672px;
`

const Bottom = styled.div`
    display: flex;
    justify-content: space-between;
    line-height: 32px;
    font-size: 1rem;
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
    const shareElement = ref<any>();

    let app: App | null = null
    const el = ref<HTMLDivElement>();

    const user = utools.getUser();

    function close() {
        // 组件取消挂载
        app && app.unmount();
        // 销毁元素
        modalReturn.close();
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
            })
        })
    }

    const render = () => <NoteInfo class={{'bg-color': true, 'detach': detach.value}}>
        <PageHeader title="卡片笔记" subtitle={toDateString(noteContent.value.id)} onBack={close}>
            {{
                extra: () => <Button type={'text'} onClick={share}>分享</Button>
            }}
        </PageHeader>
        <Container>
            <Content ref={shareElement}>
                <Card class="card no-padding" style={{margin: '0'}}>
                    <NotePreview content={noteContent.value} ellipsis={false}/>
                </Card>
                <Card style="margin: 7px 0 0;" class={'card'}>
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
                            <Tooltip content={'新增评论'}>
                                <Button onClick={() => openCommentBox(record, () => {
                                    // TODO：更新自身数据
                                }).then(update)}>{{
                                    icon: () => <IconPlus/>
                                }}</Button>
                            </Tooltip>
                            <Tooltip content={'编辑笔记'}>
                                <Button onClick={() => onUpdate(record)}>{{
                                    icon: () => <IconEdit/>
                                }}</Button>
                            </Tooltip>
                            <Tooltip content={'分享'}>
                                <Button onClick={() => createExportImage(noteContent.value)}>{{
                                    icon: () => <IconExport/>
                                }}</Button>
                            </Tooltip>
                        </ButtonGroup>
                    </Bottom>
                </Card>
                <Card style="margin: 7px 0 0;" class={'card'}>
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
                </Card>
            </Content>
        </Container>
    </NoteInfo>;

    watch(el, value => {
        if (value && !app) {
            app = createApp({render});
            app.use(ArcoVue).use(ArcoVueIcon);
            app.mount(value);
        }else {

        }
    })

    const modalReturn = Drawer.open({
        footer: false,
        header: false,
        mask: false,
        width: '100vw',
        content: () => <div ref={el}/>,
        onBeforeClose() {
            app && app.unmount();
        },
    });

}
