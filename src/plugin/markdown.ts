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
            const tagHTML = `<span class="card-tag" onclick="window.onTagSearch('${tag.substring(1)}')">${tag}</span>`;
            text = text.replace(tag, tagHTML);
        });
    }
    return text;
};
renderer.link = (href, title, text) => {
    if (window.isUtools) {
        return `<a href="${href}" title="${title || ''}" onclick="utools.shellOpenExternal('${href}')">${text}</a>`;
    } else {
        return `<a href="${href}" title="${title || ''}" target="_blank">${text}</a>`;
    }
}

const marked = new Marked({
    renderer: renderer,
}, markedHighlight({
    langPrefix: 'hljs language-',
    highlight(code, lang) {
        let html = code;
        if (lang && hljs.getLanguage(lang)) {
            html = hljs.highlight(code, {
                language: lang,
                ignoreIllegals: true
            }).value
        }
        return `<span class="name">${lang}</span><span class="copy" onclick="utools.copyText(\`${code}\`);window.openMessage('已成功复制到剪切板', 'success')">复制代码</span>${html}`;
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
