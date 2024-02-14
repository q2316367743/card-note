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
