import { SyncSetting } from "@/entity/SyncSetting";
import Constant from "@/global/Constant";
import { createClient, WebDAVClient } from "webdav";
import { StoreService } from "..";
import MessageUtil from "@/utils/MessageUtil";

export function buildPath(key ?: string) {
    if (!key) {
        return `/${Constant.id}`;
    }
    if (key.startsWith("/")) {
        return `/${Constant.id}${key}`;
    }
    return `/${Constant.id}/${key}`;
}

export async function folderCreate(client : WebDAVClient) {
    const rootExist = await client.exists(buildPath());
    if (!rootExist) {
        await client.createDirectory(buildPath());
    }
    const listExist = await client.exists(buildPath("list"));
    if (!listExist) {
        await client.createDirectory(buildPath("list"));
    }
    const noteExist = await client.exists(buildPath("note"));
    if (!noteExist) {
        await client.createDirectory(buildPath("note"));
    }
}


export class StoreServiceByWebDav implements StoreService {

    private readonly client : WebDAVClient;

    constructor(syncSetting : SyncSetting) {
        this.client = createClient(syncSetting.url, {
            username: syncSetting.username,
            password: syncSetting.password
        });
        // 检查文件夹
        folderCreate(this.client).then(() => MessageUtil.success("检查文件夹完成"));
    }

    exist(key : string) : Promise<boolean> {
        return this.client.exists(buildPath(key));
    }

    get(key : string) : Promise<string> {
        return this.client.getFileContents(buildPath(key), {
            format: 'text'
        }) as Promise<string>
    }

    set(key : string, content : string) : Promise<boolean> {
        return this.client.putFileContents(buildPath(key), content)
    }

    delete(key: string): Promise<void> {
        return this.client.deleteFile(buildPath(key));
    }

}
