import {NoteContent} from "@/entity/Note";
import {
    Avatar,
    Button,
    Modal,
    Option,
    Select,
    TypographyParagraph,
} from "@arco-design/web-vue";
import {IconDownload} from "@arco-design/web-vue/es/icon";
import {toDateString} from "xe-utils";
import {ref} from "vue";
import html2canvas from "html2canvas";
import {downloadByUrl} from "@/utils/BrowserUtil";
import {useAppStore} from "@/store/AppStore";
import NotePreview from "@/components/CardNote/NotePreview.vue";

export function createExportImage(note: NoteContent) {

    const user = utools.getUser();
    const id = "preview-" + note.id;
    const theme = ref(0);

    Modal.open({
        title: "分享 卡片笔记",
        draggable: true,
        footer: false,
        bodyClass: 'preview-model',
        content: () => <div>
            <TypographyParagraph class="option">
                <Button type={"outline"} onClick={() => downloadImage(id)}>
                    {{
                        default: () => "图片",
                        icon: () => <IconDownload/>
                    }}
                </Button>
                <Select style="width: 140px;" v-model={theme.value}>
                    <Option value={0}>默认主题</Option>
                </Select>
            </TypographyParagraph>
            <div class="card preview" id={id}>
                <div class="title">
                    <span class="create-time">{toDateString(note.id)}</span>
                </div>
                <NotePreview content={note} class="body" ellipsis={false}/>
                {user && <div class="bottom">
                    <div class="user">
                        <Avatar imageUrl={user.avatar}/>
                        <span class="nickname">{user.nickname}</span>
                    </div>
                    <span class="extra">编辑于 卡片笔记</span>
                </div>}

            </div>
        </div>
    })
}

function downloadImage(id: string) {
    html2canvas(document.getElementById(id) as HTMLElement, {
        backgroundColor: useAppStore().isDarkColors() ? '#2A2A2B' : '#ffffff',
        useCORS: true,
        allowTaint: true,
    }).then(canvas => downloadByUrl(canvas.toDataURL(), "分享图.png"))
}

