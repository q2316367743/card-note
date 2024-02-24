import {defineStore} from "pinia";
import {computed, ref, watch} from "vue";
import {getItem, setItem} from "@/utils/utools/DbStorageUtil";
import DbKeyEnum from "@/enumeration/DbKeyEnum";
import {useWindowSize} from "@vueuse/core";
import Constant from "@/global/Constant";
import eruda from "eruda";

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

    let themeType = ref(0);
    const dark = ref(renderIsDark(themeType.value));
    const ellipseRows = ref(10);

    watch(() => themeType.value, value => {
        setItem(DbKeyEnum.KEY_THEME, value);
        dark.value = renderIsDark(value);
    })
    watch(() => ellipseRows.value, value => setItem(DbKeyEnum.KEY_ELLIPSE_ROWS, value))

    const size = useWindowSize();
    const isMobile = computed(() => Constant.platform === 'mobile' || size.width.value < size.height.value * 0.75);

    function init() {
        // 初始化主题
        themeType.value = getItem<number>(DbKeyEnum.KEY_THEME) || 0;
        ellipseRows.value = getItem<number>(DbKeyEnum.KEY_ELLIPSE_ROWS) || 10;
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
