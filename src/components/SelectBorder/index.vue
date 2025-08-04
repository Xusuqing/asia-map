<template>
    <button class="start" :class="{ active: start }" @click="startSelect">选择边界</button>

</template>

<script setup lang="ts">
import { defineEmits } from 'vue'
defineOptions({
    name: 'SelectBorder'
})
import { ref, watch } from 'vue';

let start = ref(false)
const startSelect = (name: string) => {
    start.value = !start.value
    if (start.value) {
        console.log(name);
    }
}
const emit = defineEmits(['passFunction'])
emit('passFunction', startSelect)
</script>

<style scoped>
.start.active {
    background-color: #4CAF50;
    /* 绿色背景 */
    color: white;
    /* 白色文字 */
}
</style>