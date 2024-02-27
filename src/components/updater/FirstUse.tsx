// 第一次使用
import {Modal, Typography, TypographyParagraph} from "@arco-design/web-vue";

export function openFirstUse(): Promise<void> {
    return new Promise(resolve => {
        Modal.open({
            title: '欢迎使用【卡片笔记】',
            footer: false,
            onClose: resolve,
            content: () => <Typography>
                <TypographyParagraph>
                    卡片笔记，如果熟悉 memos 或者 flomo 的话，就会对这个插件很熟悉
                </TypographyParagraph>
                <TypographyParagraph>
                    卡片笔记是一种用于记录和存储信息的文本文件，它可以帮助人们记录重要的想法、日志、备忘录或其他内容。
                </TypographyParagraph>
                <TypographyParagraph>
                    <ol>
                        <li>功能：卡片笔记可以帮助人们记录重要的想法、日志、备忘录或其他内容，并且可以在任何时间随时查看这些信息。</li>
                        <li>特性：卡片笔记可以使用不同的格式来存储信息，例如文本、图片、音频和视频等，并且可以通过多种方式分享，包括电子邮件、即时聊天工具和社交媒体等。</li>
                        <li>优势：卡片笔记可以节省时间，因为它可以让人们快速记录和存储信息，而不需要手动记录。一，卡片笔记也可以帮助人们更好地管理信息，因为它可以将信息分类，以便更容易查找。</li>
                    </ol>
                </TypographyParagraph>
            </Typography>
        })
    })
}
