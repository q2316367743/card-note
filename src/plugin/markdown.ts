// 自定义 Renderer
import {marked} from "marked";
import {SOURCE_TAG_REGEX} from "@/store/TagStore";

const renderer = new marked.Renderer();
renderer.text = function (text) {
    const tags = text.match(SOURCE_TAG_REGEX);
    if (tags) {
        tags.forEach(tag => {
            const tagHTML = `<span class="card-tag">${tag}</span>`;
            text = text.replace(tag, tagHTML);
        });
    }
    return text;
};


export async function renderMarkdown(markdown?: string): Promise<string> {
    if (!markdown) {
        return Promise.resolve("");
    }
    let res = marked(markdown, {
        renderer: renderer
    });
    if (typeof res === 'string') {
        return Promise.resolve(res);
    } else {
        return res;
    }
}
