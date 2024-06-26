import {base64toBlob, blobToBase64} from "@/utils/file/CovertUtil";
import {RedirectPreload} from "@/plugin/utools/types";
import {getAttachmentAsync, postAttachment} from "@/utils/utools/DbStorageUtil";
import {ATTACHMENT_PREFIX, UTOOLS_PREFIX} from "@/entity/Role";
import {isUtools} from "@/plugin/utools";
import Constant from "@/global/Constant";

const BASE64_PREFIX: string = 'data:image/png;base64,';

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
    return postAttachment(ATTACHMENT_PREFIX + Date.now(), data);

}

/**
 * 文件上传组件
 * @param data 图片数据
 * @return 链接
 */
export async function useImageUpload(data: File | string): Promise<string> {
    const id = await useImageUploadByUtools(data);
    return UTOOLS_PREFIX + Constant.id + id;
}

// --------------------------------------------------------------------------------------------------------------
// --------------------------------------------------- 加载图片 ---------------------------------------------------
// --------------------------------------------------------------------------------------------------------------

const startIndex = UTOOLS_PREFIX.length + Constant.id.length;

export function buildUrlFromUtools(url: string) {
    if (url.startsWith(UTOOLS_PREFIX)) {
        return url.substring(startIndex);
    }
    return url
}

export function transformImgUrl(url: string): Promise<string> {
    if (url.startsWith(UTOOLS_PREFIX)) {
        return getAttachmentAsync(url.substring(startIndex));
    }
    return Promise.resolve(url);
}

