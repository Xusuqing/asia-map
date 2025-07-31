<template v-if="mapGroup">
    <button id="customize-colors" :class="{ active: showOptionColors }" @click="toggleCustomColors">个性化颜色</button>

    <button id="showName" :class="{ active: showRegionNames }" @click="toggleRegionNames">显示地名</button>
    <button id="yamatai-colors" :class="{ active: showYamataiColors }" @click="toggleYamataiColors">邪马台颜色</button>
    <button id="dog-slave-state" :class="{ active: showGonugoku }" @click="toggleGonugoku">狗奴国显现</button>
</template>


<script setup lang="ts">
import * as d3 from 'd3'
import { defineProps, defineOptions, withDefaults } from 'vue';
import { showOptionColors, regionColors, defaultColor, showYamataiColors, highlightRegion, showRegionNames, showGonugoku } from '../../config/config';
defineOptions({
    name: 'Episode1'
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
    // path: d3.GeoPath<any, any> | null,
    // rotationAngle: number,
}
const { mapGroup, labelContainers } = withDefaults(defineProps<Props>(), {
    mapGroup: null,
    labelContainers: null,
})

// 初始化一下地名配置
labelContainers!.selectAll(".region-label")
    // @ts-ignore
    .text(d => d.properties.chineseName || d.properties.name)
    .transition()
    .duration(500)
    .attr("opacity", showRegionNames.value ? 1 : 0);


// 个性化颜色控制
const toggleCustomColors = () => {
    showOptionColors.value = !showOptionColors.value;
    mapGroup!.selectAll(".region")
        .transition()
        .duration(500)
        // @ts-ignore
        .attr("fill", d => showOptionColors.value ? regionColors[d.properties.name] || defaultColor : defaultColor);
};

// 显示地名控制
const toggleRegionNames = () => {
    showRegionNames.value = !showRegionNames.value
    labelContainers!.selectAll(".region-label")
        // @ts-ignore
        .text(d => d.properties.chineseName || d.properties.name)
        .transition()
        .duration(500)
        .attr("opacity", showRegionNames.value ? 1 : 0);
};

// 邪马台颜色控制
const toggleYamataiColors = () => {
    showYamataiColors.value = !showYamataiColors.value;
    mapGroup!.selectAll(".region")
        .each(d => {
            // @ts-ignore
            if (d.properties.name.includes("区")) {
                // @ts-ignore
                showYamataiColors.value ? highlightRegion(mapGroup!, d.properties.name) : highlightRegion(mapGroup!, d.properties.name, true, "#B79220")
            }
        });
    // 如果不显示地名，并且为邪马台颜色，则不显示地名
    if (showYamataiColors.value && !showRegionNames.value) {
        console.log("不显示地名");

        // 将邪马台名字去掉
        labelContainers!.selectAll(".region-label")
            // @ts-ignore
            .filter(d => d.properties.chineseName == "福冈县")
            .text("邪马台")
            .transition()
            .duration(500)
            .attr("opacity", 0)
    }
    // 如果不显示地名，并且不为邪马台颜色，则将福冈县名字改成邪马台，并进行一定偏移
    else if (!showYamataiColors.value && !showRegionNames.value) {
        // 显示邪马台名字
        labelContainers!.selectAll(".region-label")
            // @ts-ignore
            .filter(d => d.properties.chineseName == "福冈县")
            .text("邪马台")
            .attr("opacity", 1)
            .attr("x", () => 10)
            .attr("y", () => 5);
    }
};

// 狗奴国显现控制
const toggleGonugoku = () => {
    showGonugoku.value = !showGonugoku.value;
    if (showGonugoku.value) {
        d3.select("#dog-slave-state").classed("active", true);
        highlightRegion(mapGroup!, "Kumamoto")
        // 显示狗奴国名字
        labelContainers!.selectAll(".region-label")
            // @ts-ignore
            .filter(d => d.properties.chineseName == "熊本县")
            .text("狗奴国")
            .transition()
            .duration(500)
            .attr("opacity", 1)
    } else {
        d3.select("#dog-slave-state").classed("active", false);
        highlightRegion(mapGroup!, "Kumamoto", true, defaultColor)
        // 隐藏狗奴国名字
        labelContainers!.selectAll(".region-label")
            // @ts-ignore
            .filter(d => d.properties.chineseName == "熊本县")
            .text("狗奴国")
            .transition()
            .duration(500)
            .attr("opacity", 0)
    }
};
</script>


<style scoped>
button {
    margin: 5px;
    padding: 5px 10px;
    cursor: pointer;
}

#showName.active {
    background-color: #4CAF50;
    /* 绿色背景 */
    color: white;
    /* 白色文字 */
}

#customize-colors.active {
    background-color: #2196F3;
    /* 蓝色背景 */
    color: white;
    /* 白色文字 */
}

#yamatai-colors.active {
    background-color: #FF9800;
    /* 橙色背景 */
    color: white;
    /* 白色文字 */
}


#dog-slave-state.active {
    background-color: #FF5722;
    /* 红色背景 */
    color: white;
    /* 白色文字 */
}

.region-label {
    font-size: 3px;
    text-anchor: middle;
    pointer-events: none;
    fill: #F5F5DC;
}
</style>