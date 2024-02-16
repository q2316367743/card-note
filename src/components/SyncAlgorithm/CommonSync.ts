import {WebDAVClient} from "webdav";
import Constant from "@/global/Constant";

export function buildPath(key?: string) {
    if (!key) {
        return `/${Constant.id}`;
    }
    if (key.startsWith("/")) {
        return `/${Constant.id}${key}`;
    }
    return `/${Constant.id}/${key}`;
}


export async function folderCreate(client: WebDAVClient) {
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
