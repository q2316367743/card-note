import {defineStore} from "pinia";
import {computed, ref, watch} from "vue";
import {getItem, setItem} from "@/utils/utools/DbStorageUtil";
import DbKeyEnum from "@/enumeration/DbKeyEnum";
import {useWindowSize} from "@vueuse/core";
import Constant from "@/global/Constant";
import eruda from "eruda";
import {openFirstUse} from "@/components/updater/FirstUse";
import {openVersionUpdate} from "@/components/updater/VersionUpdate";

function renderIsDark(theme: number | null) {
    switch (theme) {
        case 1:
            // 白天
            return false;
        case 2:
            // 黑夜
            return true;
        default:
            // 跟随系统
            return utools.isDarkColors();
    }
}

export const devTool = ref(false);
watch(() => devTool.value, value => value ? eruda.init() : eruda.destroy());


export const useAppStore = defineStore('app', () => {
    const themeType = ref(0);
    const dark = ref(renderIsDark(themeType.value));
    const ellipseRows = ref(10);

    watch(() => themeType.value, value => {
        setItem(DbKeyEnum.KEY_THEME, value);
        dark.value = renderIsDark(value);
    })
    watch(() => ellipseRows.value, value => setItem(DbKeyEnum.KEY_ELLIPSE_ROWS, value))

    const size = useWindowSize();
    const isMobile = computed(() => size.width.value < size.height.value * 0.75);

    async function init() {
        // 初始化主题
        themeType.value = getItem<number>(DbKeyEnum.KEY_THEME) || 0;
        ellipseRows.value = getItem<number>(DbKeyEnum.KEY_ELLIPSE_ROWS) || 10;

        const oldVersion = getItem<number>(DbKeyEnum.KEY_VERSION) || 0;
        try {
            if (oldVersion === 0) {
                await openFirstUse();
            }
        } catch (_ignore) {
        }
        try {
            if (oldVersion < Constant._version) {
                // 版本更新
                await openVersionUpdate();
            }
        } catch (_ignore) {
        }
        setItem(DbKeyEnum.KEY_VERSION, Constant._version);
    }

    function isDarkColors() {
        return dark.value;
    }


    function saveThemeType(res: number) {
        themeType.value = res;
    }

    function saveEllipseRows(res: number) {
        ellipseRows.value = res;
    }


    return {
        dark, isMobile,
        themeType, ellipseRows,
        init, isDarkColors,
        saveThemeType, saveEllipseRows
    }

})
