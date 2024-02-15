<template>
    <a-typography>
        <a-typography-paragraph :ellipsis="{ rows: 3, expandable: true}">
            <div v-html="preview" class="juejin"></div>
        </a-typography-paragraph>
        <a-typography-paragraph>
            <div v-for="relationNote in relationNotes" style="margin-bottom: 4px;" :key="relationNote.record.id">
                <a-tag color="arcoblue" bordered>
                    <template #icon>
                        <icon-link/>
                    </template>
                    · #{{ relationNote.record.id }} {{ renderContent(relationNote.record.content) }}
                </a-tag>
            </div>
        </a-typography-paragraph>
        <a-typography-paragraph>
            <div v-for="associatedNote in associatedNotes" style="margin-bottom: 4px;" :key="associatedNote.record.id">
                <a-tag color="green" bordered>
                    <template #icon>
                        <icon-share-internal/>
                    </template>
                    · #{{ associatedNote.record.id }} {{ renderContent(associatedNote.record.content) }}
                </a-tag>
            </div>
        </a-typography-paragraph>
        <a-typography-paragraph>
            <div v-for="commentNote in commentNotes" style="margin-bottom: 4px;" :key="commentNote.record.id">
                <a-tag color="gold" bordered>
                    <template #icon>
                        <icon-edit/>
                    </template>
                    · #{{ commentNote.record.id }} {{ renderContent(commentNote.record.content) }}
                </a-tag>
            </div>
        </a-typography-paragraph>
    </a-typography>
</template>
<script lang="ts" setup>
import {PropType, ref, watch} from "vue";
import {renderMarkdown} from "@/plugin/markdown";
import {NoteContent} from "@/entity/Note";
import {useNoteStore} from "@/store/NoteStore";
import {DbRecord} from "@/utils/utools/DbStorageUtil";

import {
    Typography as ATypography,
    TypographyParagraph as ATypographyParagraph,
    Tag as ATag
} from "@arco-design/web-vue";
import {IconLink, IconShareInternal, IconEdit} from "@arco-design/web-vue/es/icon";
import {renderContent} from "@/utils/BrowserUtil";

const props = defineProps({
    content: Object as PropType<NoteContent>
});

const preview = ref("");
const relationNotes = ref<Array<DbRecord<NoteContent>>>([]);
const associatedNotes = ref<Array<DbRecord<NoteContent>>>([]);
const commentNotes = ref<Array<DbRecord<NoteContent>>>([]);

watch(() => props.content,
    value => {
        relationNotes.value = [];
        associatedNotes.value = [];
        commentNotes.value = [];
        if (value) {
            // 渲染markdown
            renderMarkdown(value.content).then(html => preview.value = html)
            // 渲染关联内容
            for (let relationNote of value.relationNotes) {
                if (relationNote.type === 'COMMENT') {
                    if (relationNote.noteId === value.id) {
                        useNoteStore().getOne(relationNote.relationId).then(res => res && commentNotes.value.push(res))
                    }
                } else if (relationNote.type === 'REFERENCE') {

                    if (relationNote.noteId !== value.id) {
                        useNoteStore().getOne(relationNote.noteId).then(res => res && associatedNotes.value.push(res))
                    }
                    if (relationNote.relationId !== value.id) {
                        useNoteStore().getOne(relationNote.relationId).then(res => res && relationNotes.value.push(res))
                    }
                }


            }
        }
    },
    {immediate: true});

</script>
<style>
</style>
