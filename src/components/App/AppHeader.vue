<template>
    <a-layout-header>
        <div class="card card-container nav" style="height: 40px">
            <div class="header">
                <div>
                    <a-dropdown position="bl">
                        <a-button type="text">
                            <template #icon>
                                <icon-menu/>
                            </template>
                        </a-button>
                        <template #content>
                            <a-doption @click="$router.push('/home')">
                                <template #icon>
                                    <icon-home/>
                                </template>
                                首页
                            </a-doption>
                            <a-doption @click="$router.push('/calendar')">
                                <template #icon>
                                    <icon-calendar/>
                                </template>
                                每日回顾
                            </a-doption>
                            <a-doption @click="$router.push('/statistics')">
                                <template #icon>
                                    <icon-bar-chart/>
                                </template>
                                记录统计
                            </a-doption>
                            <a-doption @click="openUploadLog()">
                                <template #icon>
                                    <icon-record/>
                                </template>
                                更新日志
                            </a-doption>
                            <a-doption @click="$router.push('/setting')">
                                <template #icon>
                                    <icon-settings/>
                                </template>
                                设置
                            </a-doption>
                        </template>
                    </a-dropdown>
                    <a-button v-if="isHome" type='text' @click="onRefresh()">
                        <template #icon>
                            <icon-refresh/>
                        </template>
                    </a-button>
                    <a-button type='text' v-if="!isUtools" disabled>
                        <template #icon>
                            <icon-search/>
                        </template>
                    </a-button>
                </div>
                <div>
                    <div class="statistics" v-if="isMobile">
                        <span>{{ day }} 天</span>
                        <a-divider direction="vertical"/>
                        <span>{{ noteLength }} 条笔记</span>
                    </div>
                    <div class="statistics" v-if="!isMobile">在过去的 {{ day }} 天中，共记录 {{ noteLength }}
                        条笔记
                    </div>
                </div>
            </div>
        </div>
    </a-layout-header>
</template>
<script lang="ts" setup>
import {computed} from "vue";
import {useAppStore} from "@/store/AppStore";
import {useNoteStore, useRefreshNoteEvent} from "@/store/NoteStore";
import {isUtools} from "@/plugin/utools";
import {openUploadLog} from "@/components/App/AppUpdateLog";
import {useRoute} from "vue-router";

const route = useRoute();

const isMobile = computed(() => useAppStore().isMobile);
const allIds = computed(() => useNoteStore().allIds())
const noteLength = computed(() => allIds.value.length);
const minDay = computed(() => Math.min(...allIds.value, new Date().getTime()));
const day = computed(() => Math.max(Math.floor(((new Date().getTime()) - minDay.value) / (24 * 60 * 60 * 1000)), 0));
const isHome = computed(() => route.path === '/home')

const onRefresh = () => useRefreshNoteEvent.emit();
</script>
<style scoped>

</style>
