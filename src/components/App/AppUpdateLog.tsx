import {Card, Drawer, Timeline, TimelineItem, Typography} from "@arco-design/web-vue";
import {updateLogs} from "@/global/updateLog";

export function openUploadLog() {
    Drawer.open({
        width: 600,
        title: '更新日志',
        footer: false,
        content: () => <Timeline mode={'left'}>
            {Object.entries(updateLogs).map(([key, value]) => <TimelineItem key={key}>
                <Card title={key}>
                    <Typography>
                        <ul>
                            {value.map(e => <li>{e}</li>)}
                        </ul>
                    </Typography>
                </Card>
            </TimelineItem>)}
        </Timeline>
    })
}
