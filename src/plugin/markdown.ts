// 自定义 Renderer
import {Marked, Renderer} from "marked";
import {markedHighlight} from "marked-highlight";
import hljs from 'highlight.js';
import {SOURCE_TAG_REGEX} from "@/store/TagStore";

const renderer = new Renderer();
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

const marked = new Marked({
    renderer: renderer,
}, markedHighlight({
    langPrefix: 'hljs language-',
    highlight(code, lang, info) {
        const language = hljs.getLanguage(lang) ? lang : 'plaintext';
        return hljs.highlight(code, {language}).value;
    }
}))

export async function renderMarkdown(markdown?: string): Promise<string> {
    if (!markdown) {
        return Promise.resolve("");
    }
    let res = marked.parse(markdown);
    if (typeof res === 'string') {
        return Promise.resolve(res);
    } else {
        return res;
    }
}
