export const statistics = (() => {
    let init = false;
    if (import.meta.env.PROD) {
        try {
            LA.init({id: "3HYNN6TT7aizMbSW", ck: "3HYNN6TT7aizMbSW", autoTrack: true, hashMode: true});

            console.log('统计服务初始化完成');
            init = true;
        } catch (e) {
            console.error("统计服务初始化失败", e);
        }
    }

    return {
        /**
         * 时间埋点
         * @param event 事件
         * @param properties 参数
         */
        track(event: string, properties?: any): void {
            if (import.meta.env.DEV) {
                console.log('开发环境：', event);
                return;
            }
            if (!init) {
                return;
            }
            try {
                LA.track(event, properties);
            } catch (e) {
                console.error(e);
            }
        }
    }
})();
