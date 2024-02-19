// vite.config.js
// @ts-ignore
import vue from "@vitejs/plugin-vue";
// @ts-ignore
import vueJsx from '@vitejs/plugin-vue-jsx'
// @ts-ignore
import {defineConfig} from "vite";
// @ts-ignore
import path from "path";
// @ts-ignore
import {VitePWA} from 'vite-plugin-pwa'

function _resolve(dir: string) {
    // @ts-ignore
    return path.resolve(__dirname, dir);
}

export default defineConfig({
    resolve: {
        alias: {
            "@": _resolve("src")
        },
    },
    plugins: [
        vue(), vueJsx(),
        VitePWA({
            manifest: {
                name: '卡片笔记',
                short_name: '卡片笔记',
                description: '卡片笔记',
                theme_color: '#3C7EFF',
                icons: [		//添加图标， 注意路径和图像像素正确
                    {
                        src: '/logo.png',
                        sizes: '256x256',
                        type: 'image/png',
                    },

                ]
            },
            registerType: 'autoUpdate',
            workbox: {
                globPatterns: ['**/*.{js,css,html,ico,png,jpg,svg}'],		//缓存相关静态资源
                runtimeCaching: [                                                     // 配置自定义运行时缓存
                    {
                        urlPattern: ({url}) => url.origin === 'https://blog.esion.xyz/apps/card-note',
                        handler: 'NetworkFirst',
                        options: {
                            cacheName: 'card-note-api',
                            cacheableResponse: {
                                statuses: [200]
                            }
                        }
                    },
                    {
                        urlPattern: /\.(?:png|jpg|jpeg|svg)$/,
                        handler: 'CacheFirst',
                        options: {
                            cacheName: 'card-note-images',
                            expiration: {
                                // 最多30个图
                                maxEntries: 30
                            }
                        }
                    },
                    {
                        urlPattern: /.*\.js.*/,
                        handler: 'StaleWhileRevalidate',
                        options: {
                            cacheName: 'card-note-js',
                            expiration: {
                                maxEntries: 30, // 最多缓存30个，超过的按照LRU原则删除
                                maxAgeSeconds: 30 * 24 * 60 * 60
                            },
                            cacheableResponse: {
                                statuses: [200]
                            }
                        }
                    },
                    {
                        urlPattern: /.*\.css.*/,
                        handler: 'StaleWhileRevalidate',
                        options: {
                            cacheName: 'card-note-css',
                            expiration: {
                                maxEntries: 20,
                                maxAgeSeconds: 30 * 24 * 60 * 60
                            },
                            cacheableResponse: {
                                statuses: [200]
                            }
                        }
                    },
                    {
                        urlPattern: /.*\.html.*/,
                        handler: 'StaleWhileRevalidate',
                        options: {
                            cacheName: 'card-note-html',
                            expiration: {
                                maxEntries: 20,
                                maxAgeSeconds: 30 * 24 * 60 * 60
                            },
                            cacheableResponse: {
                                statuses: [200]
                            }
                        }
                    }
                ]
            },
            devOptions: {
                enabled: true
            }
        })
    ],
    base: "./",
    build: {
        outDir: "src-utools/dist"
    }
});
