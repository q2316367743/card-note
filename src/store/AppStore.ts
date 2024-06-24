import {defineStore} from "pinia";
import {computed, ref, watch} from "vue";
import {getItem, setItem} from "@/utils/utools/DbStorageUtil";
import DbKeyEnum from "@/enumeration/DbKeyEnum";
import {useWindowSize} from "@vueuse/core";
import Constant from "@/global/Constant";
import eruda from "eruda";
import {openFirstUse} from "@/components/updater/FirstUse";
import {openVersionUpdate} from "@/components/updater/VersionUpdate";
import {useUtoolsDbStorage} from "@/hooks/UtoolsDbStorage";

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

export const ellipseRows = useUtoolsDbStorage(DbKeyEnum.KEY_ELLIPSE_ROWS, 3);
export const fontSize = useUtoolsDbStorage(DbKeyEnum.KEY_FONT_SIZE, 14);
export const fontFamily = useUtoolsDbStorage(DbKeyEnum.KEY_FONT_FAMILY, "'JetBrains Mono', '霞鹜文楷 GB'");
// 是否使用md编辑器
export const mdEditorEnable = useUtoolsDbStorage(DbKeyEnum.KEY_MD_EDITOR_ENABLE, false);
export const mdEditorHeight = useUtoolsDbStorage(DbKeyEnum.KEY_MD_EDITOR_HEIGHT, 200);
export const mdEditorPreview = useUtoolsDbStorage(DbKeyEnum.KEY_MD_EDITOR_PREVIEW, false);
export const mdEditorTheme = useUtoolsDbStorage(DbKeyEnum.KEY_MD_EDITOR_THEME, 'cyanosis');


export const fontSizeWrap = computed(() => fontSize.value + 'px');
const defaultFontFamily = '苹方, 微软雅黑, serif';
export const fontFamilyWrap = computed(() => {
    const res = fontFamily.value.trim();
    if (res) {
        return fontFamily.value + ',' + defaultFontFamily;
    }
    return defaultFontFamily;
});
// 是否分离
export const detach = ref(window.utools ? window.utools.getWindowType() !== 'main' : true);

export const useAppStore = defineStore('app', () => {
    const themeType = ref(0);
    const dark = ref(renderIsDark(themeType.value));

    watch(() => themeType.value, value => {
        setItem(DbKeyEnum.KEY_THEME, value);
        dark.value = renderIsDark(value);
    })

    const size = useWindowSize();
    const isMobile = computed(() => size.width.value < size.height.value * 0.75);
    const theme = computed(() => dark.value ? 'dark' : 'light');

    async function init() {
        // 初始化主题
        themeType.value = getItem<number>(DbKeyEnum.KEY_THEME) || 0;

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


    return {
        dark, isMobile, themeType, theme,
        init, isDarkColors,
        saveThemeType
    }

})
