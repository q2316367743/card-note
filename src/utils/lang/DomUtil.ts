/**
 * 获取光标所在行数
 * @param textarea 文本域
 * @return 光标所在行数
 */
export function getCursorPosition(textarea: HTMLTextAreaElement): number {
    const cursorPos = textarea.selectionStart;
    const lines = textarea.value.substring(0, cursorPos).split("\n");
    return lines.length;
}

export function loadScript(url: string, attrs?: Record<string, string>, callback?: () => void) {
    const script = document.createElement("script");
    script.src = url;
    script.async = true;
    script.type="text/javascript";
    script.setAttribute("charset","UTF-8")
    if (attrs) {
        for(let key in attrs) {
            script.setAttribute(key, attrs[key]);
        }
    }
    callback && (script.onload = callback);
    document.head.appendChild(script);
}
