<template>
    <a-typography class="note-preview">
        <a-typography-paragraph :ellipsis="ellipsis" class="preview">
            <md-preview :model-value="props.content? props.content.content:''" :theme preview-theme="vuepress"
                        code-theme="github"
                        :style="{ fontFamily: fontFamilyWrap, fontSize: fontSizeWrap}"/>
        </a-typography-paragraph>
        <a-typography-paragraph v-if="relationNotes.length > 0 && props.relation">
            <div v-for="relationNote in relationNotes" style="margin-bottom: 4px;" :key="relationNote.record.id">
                <a-tag color="arcoblue" bordered @click="open(relationNote.record.id)">
                    <template #icon>
                        <icon-link/>
                    </template>
                    · #{{ relationNote.record.id }} {{ renderContent(relationNote.record.content) }}
                </a-tag>
            </div>
        </a-typography-paragraph>
        <a-typography-paragraph v-if="associatedNotes.length > 0 && props.relation">
            <div v-for="associatedNote in associatedNotes" style="margin-bottom: 4px;" :key="associatedNote.record.id">
                <a-tag color="green" bordered @click="open(associatedNote.record.id)">
                    <template #icon>
                        <icon-share-internal/>
                    </template>
                    · #{{ associatedNote.record.id }} {{ renderContent(associatedNote.record.content) }}
                </a-tag>
            </div>
        </a-typography-paragraph>
        <a-typography-paragraph v-if="commentNotes.length > 0 && props.relation">
            <div v-for="commentNote in commentNotes" style="margin-bottom: 4px;" :key="commentNote.record.id">
                <a-tag color="gold" bordered @click="open(commentNote.record.id)">
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
import {computed, PropType, ref, watch} from "vue";
import {renderMarkdown} from "@/plugin/markdown";
import {NoteContent} from "@/entity/Note";
import {useNoteStore, useOpenNoteEvent} from "@/store/NoteStore";
import {DbRecord} from "@/utils/utools/DbStorageUtil";

import {
    Typography as ATypography,
    TypographyParagraph as ATypographyParagraph,
    Tag as ATag
} from "@arco-design/web-vue";
import {IconLink, IconShareInternal, IconEdit} from "@arco-design/web-vue/es/icon";
import {renderContent} from "@/utils/lang/BrowserUtil";
import {ellipseRows, fontFamilyWrap, fontSizeWrap, useAppStore} from "@/store/AppStore";
import {MdEditor, MdPreview} from "md-editor-v3";

const props = defineProps({
    content: Object as PropType<NoteContent>,
    // 屏蔽的评论
    commentId: Number,
    ellipsis: {
        type: Boolean,
        default: true,
    },
    relation: {
        type: Boolean,
        default: true,
    }
});

const relationNotes = ref<Array<DbRecord<NoteContent>>>([]);
const associatedNotes = ref<Array<DbRecord<NoteContent>>>([]);
const commentNotes = ref<Array<DbRecord<NoteContent>>>([]);

const theme = computed(() => useAppStore().theme);
const ellipsis = computed(() => {
    if (props.ellipsis) {
        if (ellipseRows.value > -1) {
            return {rows: ellipseRows.value, expandable: true};
        } else {
            return false;
        }
    }
    return false;
});

watch(() => props.content,
    value => {
        relationNotes.value = [];
        associatedNotes.value = [];
        commentNotes.value = [];
        if (value) {
            // 渲染关联内容
            for (let relationNote of value.relationNotes) {
                if (relationNote.type === 'COMMENT') {
                    if (relationNote.noteId === value.id && relationNote.relationId !== props.commentId) {
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

function open(id: number) {
    useOpenNoteEvent.emit(id);
}

</script>
<style lang="less">
.note-preview {
    font-size: v-bind(fontSizeWrap);
    font-family: v-bind(fontFamilyWrap);
    padding: 10px 20px;

    .md-editor-preview-wrapper {
        padding: 0;
    }

    .arco-tag {
        cursor: pointer;
    }

    .arco-typography {
        &:last-child {
            margin-bottom: 0;
        }
    }

    pre {
        code {
            margin: 0;
        }
    }
}
</style>
