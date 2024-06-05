import {computed, onMounted, onUnmounted, ref, watch} from "vue";

export function usePageSearch() {
    const keyword = ref('');

    const available = computed(() => keyword.value.trim() !== '');


    watch(keyword, text => {
        if (text) {
            utools.findInPage(text, {
                matchCase: false,
                wordStart: true
            });
        } else {
            utools.stopFindInPage('clearSelection')
        }
    });

    function forward() {
        if (keyword.value) {
            utools.findInPage(keyword.value, {
                matchCase: false,
                forward: false,
                findNext: true
            });
        }
    }

    function findNext() {
        if (keyword.value) {
            utools.findInPage(keyword.value, {
                matchCase: false,
                forward: true,
                findNext: false,
            });
        }
    }

    function onKeyDown(e: KeyboardEvent) {
        if (e.key === 'Enter') {
            if (keyword.value) {
                if (e.shiftKey) {
                    forward();
                } else {
                    findNext();
                }
            }
        }
    }

    onMounted(() => {
        utools.setSubInput(({text}) => keyword.value = text, "在页面中搜索", true);
        window.addEventListener('keydown', onKeyDown)
    });

    onUnmounted(() => {
        window.removeEventListener('keydown', onKeyDown);
        utools.removeSubInput()
    });

    function close() {
        utools.setSubInputValue('')
    }

    return {keyword, available, forward, findNext, close}


}
