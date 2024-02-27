import {Modal, Typography, TypographyParagraph} from "@arco-design/web-vue";
import Constant from "@/global/Constant";
import {updateLogs} from "@/global/updateLog";

export function openVersionUpdate(): Promise<void> {
    return new Promise(resolve => {
        const logs = updateLogs[Constant.version];
        if (!logs){
            resolve();
            return;
        }
        Modal.open({
            title: '恭喜你更新到：' + Constant.version,
            footer: false,
            onClose: resolve,
            content: () => <Typography>
                <TypographyParagraph>
                    <ol>
                        {logs.map(log => <li>{log}</li>)}
                    </ol>
                </TypographyParagraph>
            </Typography>
        })
    })
}
