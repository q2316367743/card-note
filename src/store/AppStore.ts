import {defineStore} from "pinia";
import {computed, ref, watch} from "vue";
import {getItem} from "@/utils/utools/DbStorageUtil";
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
    const dark = ref(false);
    let themeType = 0;
    const size = useWindowSize();
    const isMobile = computed(() => Constant.platform === 'mobile' || size.width.value < size.height.value * 0.75);


    function init() {
        // 初始化主题
        themeType = getItem<number>(DbKeyEnum.KEY_THEME) || 0;
        dark.value = renderIsDark(themeType);
    }

    function isDarkColors() {
        return dark.value;
    }

    function getThemeType() {
        return themeType;
    }

    function saveThemeType(res: number) {
        themeType = res;
        dark.value = renderIsDark(themeType);
        utools.dbStorage.setItem(DbKeyEnum.KEY_THEME, themeType);
    }


    return {dark, isMobile, init, isDarkColors, getThemeType, saveThemeType}

})
