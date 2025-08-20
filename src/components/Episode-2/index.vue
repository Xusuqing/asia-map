<template v-if="mapGroup">
    <button id="customize-colors" :class="{ active: showOptionColors }" @click="toggleCustomColors">个性化颜色</button>
    <button id="showKorea" :class="{ active: showKorea }" @click="toggleKorea">朝鲜</button>
    <button id="showJuanzhou" @click="showJuanzhou = !showJuanzhou">卷轴</button>
    <button id="showWenyi" @click="showWenyi">瘟疫</button>
    <Juanzhou v-if="showJuanzhou" :mapGroup="mapGroup" :labelContainers="labelContainers" />
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { highlightRegion, defaultColor } from '../../config/config';
import Juanzhou from '../juanzhou.vue';
import { table } from "../../config/translate";
import type { BaseType } from 'd3';
defineOptions({
    name: 'Episode2'
})
interface Props {
    mapGroup: d3.Selection<SVGGElement, unknown, HTMLElement, any> | null,
    labelContainers: d3.Selection<SVGGElement, {
        type: string;
        properties: {
            name?: string;
            chineseName?: string;
            kuname?: string;
        };
        geometry: {
            coordinates: number[][][][];
            type: string;
        };
    }, SVGGElement, unknown> | null,
}
const { mapGroup, labelContainers } = withDefaults(defineProps<Props>(), {
    mapGroup: null,
    labelContainers: null,
})

// 显示大和领地
const showOptionColors = ref(false)
const customColorArray = ["Yamanashi", "Aichi", "Chiba", "Ehime", "Fukui", "Fukuoka", "Gifu", "Gunma", "Hiroshima", "Hyogo", "Ibaraki", "Ishikawa", "Kagawa", "Kagoshima", "Kanagawa", "Kochi", "Kumamoto", "Kyoto", "Mie", "Miyazaki", "Nagano", "Nagasaki", "Nara", "Niigata", "Oita", "Okayama", "Osaka", "Saga", "Saitama", "Shiga", "Shimane", "Shizuoka", "Tochigi", "Tokushima", "Tokyo", "Tottori", "Toyama", "Wakayama", "Yamaguchi"]
const toggleCustomColors = () => {
    showOptionColors.value = !showOptionColors.value
    customColorArray.forEach((item) => {
        if (showOptionColors.value) {
            highlightRegion(mapGroup!, item, true, "#9c27b0")
        } else {
            highlightRegion(mapGroup!, item, true, defaultColor)
        }
        const targetRegion = mapGroup!.select(`.region[data-name="${table[item]}"]`);
        targetRegion.attr("filter", `brightness(1)`)
    })
}

// 显示朝鲜各国
const showKorea = ref(false)
const toggleKorea = () => {
    showKorea.value = !showKorea.value;
    showKorea.value &&
        mapGroup?.append("image")
            .attr("class", "map-image-1") // 自定义类名，用于样式控制
            .attr("xlink:href", "/jiaye.png") // 图片URL（示例图）
            .attr("width", 58) // 图片宽度
            .attr("transform", "rotate(0)")
            .attr("x", 472)
            .attr("y", 460.4)
            .attr("opacity", 1)
    showKorea.value &&
        mapGroup?.append("image")
            .attr("class", "map-image-1") // 自定义类名，用于样式控制
            .attr("xlink:href", "/gaogoli1.png") // 图片URL（示例图）
            .attr("width", 324) // 图片宽度
            .attr("transform", "rotate(11)")
            .attr("x", 298)
            .attr("y", -20)
    const deleteArray = ["Kangwon-do", "Pyongannam-do", "Hwanghaenam-do", "Hamgyongnam-do", "North Hamgyong"]
    // 将deleteArray的元素从data中隐藏
    mapGroup?.selectAll(".region")
        // @ts-ignore
        .filter(d => deleteArray.includes(d.properties.name))
        .style("opacity", showKorea.value ? 0 : 1)
    // 新罗
    const xinluoArray = ["Busan", "Daegu", "Ulsan", "Chungcheongbuk-do", "Gyeongsangbuk-do", "Kangwon-do"]
    // 百济
    const baijiArray = ["Hwanghaebuk-do", "Seoul", "Incheon", "Gwangju", "Daejeon", "Sejong", "Gyeonggi-do", "Chungcheongnam-do", "Jeollabuk-do", "Jeollanam-do", "Pyongannam-do", "Hwanghaenam-do"]

    xinluoArray.forEach((item) => {
        highlightRegion(mapGroup!, item, true, "#DDA0DD")
    })
    baijiArray.forEach((item) => {
        highlightRegion(mapGroup!, item, true, "#FFD700")
    })

    labelContainers!.selectAll(".region-label")
        // @ts-ignore
        .filter(d => d.properties.chineseName == "忠清南道")
        .text("百济")
        .attr("opacity", 1)
        .attr("x", () => 0)
        .attr("y", () => 0)
        .style("font-size", "10px")
        .style("fill", "black")
        ;
    labelContainers!.selectAll(".region-label")
        // @ts-ignore
        .filter(d => d.properties.chineseName == "庆尚北道")
        .text("新罗")
        .attr("opacity", 1)
        .attr("x", () => 0)
        .attr("y", () => 0)
        .style("font-size", "10px")
        .style("fill", "black")
        ;
}

const showJuanzhou = ref(false)

// 大和领内瘟疫
let animationIds: Array<{ id: number, count: number, brightness: number, direction: number }> = []
const showWenyi = () => {
    animationIds = []
    customColorArray.forEach((item, index) => {
        animationIds.push({ id: 0, count: 0, brightness: 1, direction: 0.01 })
        const targetRegion = mapGroup!.select(`.region[data-name="${table[item]}"]`);
        updateBrightness(targetRegion, index)
        // setTimeout(() => {
        //     cancelAnimationFrame(animationIds[index].id)
        // }, 2600)
    })
}

const maxBrightness = 2; // 最大亮度
const minBrightness = 1; // 最小亮度
// 更新亮度
function updateBrightness(element: d3.Selection<BaseType, unknown, HTMLElement, any>, index: number) {
    element.attr("filter", `brightness(${animationIds[index].brightness})`).attr("fill", "#7D2E2E")

    // 更新亮度值
    animationIds[index].brightness += animationIds[index].direction;

    // 反转方向
    if (animationIds[index].brightness >= maxBrightness) {
        animationIds[index].brightness = maxBrightness;
        animationIds[index].direction = -0.01;
        animationIds[index].count++
        // if (animationIds[index].count >= 2) {
        //     return
        // }
    } else if (animationIds[index].brightness <= minBrightness) {
        animationIds[index].brightness = minBrightness;
        animationIds[index].direction = 0.01;
    }
    if (animationIds[index].brightness <= 1.5 && animationIds[index].count >= 2) {
        return
    }
    // 继续动画
    animationIds[index].id = requestAnimationFrame(() => updateBrightness(element, index));
}
</script>

<style scoped>
#customize-colors.active {
    background-color: #2196F3;
    /* 蓝色背景 */
    color: white;
    /* 白色文字 */
}

#showKorea.active {
    background-color: #4CAF50;
    /* 绿色背景 */
    color: white;
    /* 白色文字 */
}
</style>