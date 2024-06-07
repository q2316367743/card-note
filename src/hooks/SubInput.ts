import { computed, onMounted, onUnmounted, ref, ComputedRef } from "vue";
import { createEventHook, EventHookOn } from "@vueuse/core";

export interface UseSubInputResult {

    /**
     * 当前子输入框的值，只读
     */
    subInput: ComputedRef<string>;

    /**
     * 设置子输入框的值
     * @param value 子输入框的值
     */
    setSubInput(value: string): void;

    /**
     * 当数据变更
     */
    onChanged: EventHookOn<string>;

    /**
     * 当搜索时，按下Enter触发
     */
    onSearch: EventHookOn<string>

    /**
     * 当数据清空时，按下Enter触发
     */
    onClear: EventHookOn<void>
}

/**
 * 子输入框hook
 * @param initialValue 子输入框初始值
 * @param placeholder 占位符
 * @param isFocus 是否聚焦，默认true
 */
export function useSubInput(initialValue: string = '', placeholder?: string, isFocus?: boolean): UseSubInputResult {
    // 子输入框的值
    const subInput = ref(initialValue);
    // 子输入的包装值
    const subInputWrap = computed(() => subInput.value);

    // 当数据变化的hook
    const onChangedHook = createEventHook<string>();
    // 当搜索时的hook
    const onSearchHook = createEventHook<string>();
    // 当搜索时的hook
    const onClearHook = createEventHook<void>();

    // 键盘按下的事件监听
    function handleKeyDown(e: KeyboardEvent) {
        if (e.key === 'Enter' && subInput.value) {
            onSearchHook.trigger(subInput.value);
            e.preventDefault();
            e.stopPropagation();
        }
    }

    onMounted(() => {
        // 使用定时器，确保一定注册成功
        const interval = setInterval(() => {
            let res = utools.setSubInput(({ text }) => {
                if (subInput.value !== text) {
                    subInput.value = text;
                    onChangedHook.trigger(text);
                    if (!text) {
                        onClearHook.trigger();
                    }
                }
            }, placeholder, isFocus);
            // 如果注册成功
            if (res) {
                // 设置初始值
                if (initialValue) {
                    utools.setSubInputValue(initialValue);
                }
                // 清除定时器
                clearInterval(interval)
            }
        }, 100);

        window.addEventListener('keydown', handleKeyDown)
    });

    onUnmounted(() => {
        utools.removeSubInput();
        window.removeEventListener('keydown', handleKeyDown);
    });

    function setSubInput(val: string) {
        subInput.value = val;
        utools.setSubInputValue(subInput.value);
    }

    return {
        subInput: subInputWrap, setSubInput,
        onChanged: onChangedHook.on, onSearch: onSearchHook.on, onClear: onClearHook.on
    };
}
