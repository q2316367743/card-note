export const statistics = (() => {

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
            try {
                umami.track(event, properties);
            } catch (e) {
                console.error(e);
            }
        }
    }
})();
