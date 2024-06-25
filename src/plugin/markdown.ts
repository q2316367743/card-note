import MarkdownIt from 'markdown-it';
import hljs from 'highlight.js';
import {SOURCE_TAG_REGEX} from "@/store/TagStore";
import {isUtools} from "@/plugin/utools";


const md = new MarkdownIt({
    html: true,        // 在源码中启用 HTML 标签
    langPrefix: 'language-',  // 给围栏代码块的 CSS 语言前缀。对于额外的高亮代码非常有用。
    linkify: true,        // 将类似 URL 的文本自动转换为链接。
    // 启用一些语言中立的替换 + 引号美化
    typographer: true,
})


export function tagPlugin(md: MarkdownIt) {
    md.inline.ruler.before('text', 'tag', (state, silent) => {
        if (silent) return false;

        const match = SOURCE_TAG_REGEX.exec(state.src.slice(state.pos));
        if (match) {
            const tag = match[0].slice(1); // Remove the '#'
            state.pos += match.index + match[0].length;

            const token = state.push('tag_open', 'span', 1);
            token.attrs = [['class', 'card-tag'], ['onclick', `window.onTagSearch('${encodeURIComponent(tag)}')`]];
            token.markup = '#';

            const textToken = state.push('text', '', 0);
            textToken.content = `#${tag}`;

            state.push('tag_close', 'span', -1);

            return true;
        }

        return false;
    });
}

export function linkPlugin(md: MarkdownIt) {
    const defaultRender = md.renderer.rules.link_open || function (tokens, idx, options, _env, self) {
        return self.renderToken(tokens, idx, options);
    };
    md.renderer.rules.link_open = function (tokens, idx, options, env, self) {
        // 如果你确认其他的插件不能添加 `target` - 放弃以下检查：
        const aIndex = tokens[idx].attrIndex('target');
        const href = tokens[idx].attrGet('href');

        if (aIndex < 0) {
            tokens[idx].attrPush(['target', '_blank']); // 添加新属性
        } else {
            let attrs = tokens[idx].attrs;
            if (attrs) {
                attrs[aIndex][1] = '_blank';    // 替换已经存在的属性值
            }
        }

        if (isUtools) {
            tokens[idx].attrPush(['onclick', `utools.shellOpenExternal('${encodeURIComponent(href || '')}')`])
        }

        // 传递 token 到默认的渲染器。
        return defaultRender(tokens, idx, options, env, self);
    };
}

export function highlightPlugin(md: MarkdownIt) {
    md.options.highlight = (code, lang) => {
        let html: string;
        try {
            if (lang && hljs.getLanguage(lang)) {
                html = hljs.highlight(code, {
                    language: lang,
                    ignoreIllegals: true
                }).value
            } else {
                html = hljs.highlightAuto(code).value;
            }
        } catch (e) {
            console.error(e);
            html = code;
        }

        return `<pre class="hljs language-${lang}"><code><span class="name">${lang}</span><span class="copy" onclick="window.copyText(\`${encodeURIComponent(code)}\`);window.openMessage('已成功复制到剪切板', 'success')">复制代码</span>${html}</code></pre>`;
    };
}

md.use(highlightPlugin).use(tagPlugin).use(linkPlugin);

export async function renderMarkdown(markdown?: string): Promise<string> {
    if (!markdown) {
        return Promise.resolve("");
    }
    let res = md.render(markdown);
    return Promise.resolve(res)
}
