import {getFromOneByAsync} from "@/utils/utools/DbStorageUtil";
import {useSyncStore} from "@/store/SyncStore";
import MessageUtil from "@/utils/MessageUtil";
import {buildPath} from "@/components/SyncAlgorithm/CommonSync";

export interface SyncState {
    key: string;
    type: 'put' | 'remove';
}



export function handleAutoSync(state: SyncState) {
    if (useSyncStore().disableAutoSync) {
        // 同步功能未开启
        return;
    }
    const client = useSyncStore().client;
    if (client == null) {
        // 客户端未初始化
        return;
    }
    if (state.type === 'put') {
        getFromOneByAsync(state.key)
            .then(res => {
                res && client.putFileContents(buildPath(state.key), JSON.stringify(res.record))
                    .then(() => {
                        console.log('自动同步成功')
                    })
                    .catch(err => {
                        MessageUtil.error('自动同步失败', err)
                    })
            })
    } else if (state.type === 'remove') {
        client.deleteFile(buildPath(state.key))
            .then(() => {
                console.log('自动同步成功')
            })
            .catch(err => {
                MessageUtil.error('自动同步失败', err)
            })
    }
}
