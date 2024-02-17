<template>
    <div class="explore">
        <card-note v-if="record" :record="record" @remove="init()" @update="update()"/>
    </div>
</template>
<script lang="ts" setup>
import CardNote from '@/components/CardNote/index.vue';
import {ref} from "vue";
import {DbRecord} from "@/utils/utools/DbStorageUtil";
import {NoteContent} from "@/entity/Note";
import {useNoteStore} from "@/store/NoteStore";

let id = 0;
const record = ref<DbRecord<NoteContent> | null>(null);

useNoteStore().init().then(init);

function update() {
    useNoteStore().getOne(id)
        .then(res => record.value = res);
}

function init() {
    const ids = useNoteStore().allIds();
    id = ids[Math.floor(Math.random() * ids.length)];
    useNoteStore().getOne(id)
        .then(res => record.value = res);
}

</script>
<style scoped>
.explore {
    padding: 0 7px;
}
</style>
