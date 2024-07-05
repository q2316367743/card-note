export default {
    // 插件的ID
    uid: 'zxwqxh7t',
    // 项目名称，英文名称
    id: 'card-note',
    // 项目中文名称
    name: '卡片笔记',
    // 版本
    version: '1.5.3',
    _version: 153,
    // 作者
    author: '落雨不悔',
    // 仓库
    repo: '',
    platform: import.meta.env.VITE_PLATFORM as Platform
}

type Platform = 'utools' | 'web' | 'chrome';
