<template>
    <div class="card">
        <div class="label">灵光一现</div>
        <div class="extra">
            <a-tooltip content="再来一篇">
                <a-button type="text" @click="init()">
                    <template #icon>
                        <icon-refresh/>
                    </template>
                </a-button>
            </a-tooltip>
        </div>
        <note-preview v-if="record" :content="record.record"/>
    </div>
</template>
<script lang="ts" setup>
import {ref} from "vue";
import {DbRecord} from "@/utils/utools/DbStorageUtil";
import {NoteContent} from "@/entity/Note";
import {useNoteStore} from "@/store/NoteStore";
import NotePreview from "@/components/CardNote/NotePreview.vue";

let id = 0;
const record = ref<DbRecord<NoteContent> | null>(null);

useNoteStore().init().then(init);


function init() {
    const ids = useNoteStore().allIds();
    id = ids[Math.floor(Math.random() * ids.length)];
    useNoteStore().getOne(id)
        .then(res => record.value = res);
}

try {
    LA.track('export');
} catch (e) {
    console.error(e);
}

</script>
<style scoped>
.explore {
    padding: 0 7px;
}
</style>
