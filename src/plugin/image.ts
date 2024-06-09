import {base64toBlob, blobToBase64} from "@/utils/file/CovertUtil";
import { RedirectPreload} from "@/plugin/utools/types";
import {getAttachmentSync, postAttachment} from "@/utils/utools/DbStorageUtil";
import {ATTACHMENT_PREFIX} from "@/entity/Role";
import {isUtools} from "@/plugin/utools";

const BASE64_PREFIX: string = 'data:image/png;base64,';

/**
 * 文件上传组件
 * @param data 图片数据
 * @param isLocal 是否是本地，默认不是
 * @return 链接
 */
export async function useImageUpload(data: File | string, isLocal: boolean = false): Promise<string> {

    try {
        let url = await selfImageUpload(data, isLocal);
        return Promise.resolve(url);
    } catch (e) {
        return Promise.reject(e)
    }

}

async function selfImageUpload(data: File | Blob | string, isLocal: boolean): Promise<string> {
    return useImageUploadByUtools(data);

}

// --------------------------------------------------------------------------------------------------------------
// --------------------------------------------------- 上传图片 ---------------------------------------------------
// --------------------------------------------------------------------------------------------------------------

async function useImageUploadByBase64(data: File | Blob | string): Promise<string> {
    if (data instanceof Blob) {
        data = await blobToBase64(data);
    }
    return data;
}

/**
 * 图片上传使用插件
 * @param data 图片数据
 */
async function useImageUploadByPlugin(data: File | Blob | string): Promise<void> {

    if (!isUtools) {
        return Promise.reject("web版不支持调用图床");
    }

    if (typeof data !== 'string') {
        data = await blobToBase64(data);
    }
    // 使用图床插件
    utools.redirect(['图床', '上传到图床'], {
        type: 'img',
        data: data
    } as RedirectPreload);
    return Promise.resolve();
}


async function useImageUploadByUtools(data: Blob | File | string): Promise<string> {
    if (typeof data === 'string') {
        data = base64toBlob(data.replace(BASE64_PREFIX, ""));
    }
    const id = new Date().getTime() + '';
    return postAttachment(
        ATTACHMENT_PREFIX + id,
        data
    );

}

// --------------------------------------------------------------------------------------------------------------
// --------------------------------------------------- 加载图片 ---------------------------------------------------
// --------------------------------------------------------------------------------------------------------------

/**
 * 根据图片ID，获取图片连接（同步）
 * @param id 附件ID
 * @return 图片地址
 */
export function useLoadImageBySync(id: string): string {
    return getAttachmentSync(id);
}

