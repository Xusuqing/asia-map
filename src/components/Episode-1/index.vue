<template v-if="mapGroup">
    <button id="customize-colors" :class="{ active: showOptionColors }" @click="toggleCustomColors">个性化颜色</button>

    <button id="showName" :class="{ active: showRegionNames }" @click="toggleRegionNames">显示地名</button>
    <button id="yamatai-colors" :class="{ active: showYamataiColors }" @click="toggleYamataiColors">邪马台颜色</button>
    <button id="dog-slave-state" :class="{ active: showGonugoku }" @click="toggleGonugoku">狗奴国显现</button>
    <button id="shouLuoyang" :class="{ active: showLuoyang }" @click="toggleLuoyang">洛阳</button>
    <button id="showJinji" :class="{ active: showJinji }" @click="toggleJinji('邪马台')">近畿邪马台</button>
    <button id="showJinji" :class="{ active: showJinji }" @click="toggleJinji('大和国')">近畿大和国</button>
    <button id="merge" :class="{ active: merge }" @click="toggleMerge">大和吞并邪马台</button>
    <button id="remerge" :class="{ active: remerge }" @click="toggleRemerge">邪马台吞并大和</button>
    <button id="showSanguo" :class="{ active: showSanguo }" @click="toggleSanguo">三国</button>
    <button id="showDongjin" :class="{ active: showDongjin }" @click="toggleDongjin">东晋</button>
    <button id="showLiusong" :class="{ active: showLiusong }" @click="toggleLiusong">刘宋</button>
    <button id="showKorea" :class="{ active: showKorea }" @click="toggleKorea">朝鲜</button>

    <button id="resetColor" @click="resetColors">重置</button>
</template>


<script setup lang="ts">
import * as d3 from 'd3'
import { defineProps, defineOptions, withDefaults, ref } from 'vue';
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
    projection: d3.GeoProjection | null,
    // path: d3.GeoPath<any, any> | null,
    // rotationAngle: number,
}
const { mapGroup, labelContainers, projection } = withDefaults(defineProps<Props>(), {
    mapGroup: null,
    labelContainers: null,
    projection: null
})

// 显示洛阳
const showLuoyang = ref(false)
const toggleLuoyang = () => {
    showLuoyang.value = !showLuoyang.value
    if (showLuoyang.value) {
        // 1. 定义目标位置经纬度（洛阳）
        const luoyangCoords: [number, number] = [112.45, 34.62]; // [经度, 纬度]

        // 2. 创建圆形的SVG容器（继承地图变换）
        const circleGroup = mapGroup!.append("g")
            .attr("class", "location-marker")
            .attr("transform", () => {
                // 将经纬度转换为屏幕坐标
                const projectedCoords = projection!(luoyangCoords);
                if (!projectedCoords) return "";
                const [x, y] = projectedCoords;
                // const [x, y] = projection!(luoyangCoords);
                // 直接平移到目标坐标（圆形默认以中心定位）
                return `translate(${x}, ${y})`;
            });

        // 3. 绘制直径100px的圆形（半径50px）
        circleGroup.append("circle")
            .attr("r", 7) // 半径50px（直径100px，与之前正方形尺寸对应）
            .attr("fill", "rgba(0, 128, 255, 0.7)") // 半透明蓝色
            .attr("stroke", "#fff")
            .attr("stroke-width", 2)
            .attr("stroke-dasharray", "5,5") // 可选：虚线边框
            .on("mouseover", function () {
                // 可选：鼠标悬停效果
                d3.select(this).attr("fill", "rgba(0, 128, 255, 1)");
            })
            .on("mouseout", function () {
                d3.select(this).attr("fill", "rgba(0, 128, 255, 0.7)");
            });

        // 4. 可选：添加文字标签
        circleGroup.append("text")
            .text("洛阳")
            .attr("text-anchor", "middle")
            .attr("dy", 20) // 文字在圆形下方
            .attr("fill", "#fff")
            .attr("font-size", 12);

    } else {
        // 移除洛阳
        mapGroup!.select(".location-marker").remove();
    }
}

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
const yamataiColor = "#B79220"
const toggleYamataiColors = () => {
    showYamataiColors.value = !showYamataiColors.value;
    const regex = /(大分|福岡).*区/;
    mapGroup!.selectAll(".region")
        .each(d => {
            // @ts-ignore
            if (regex.test(d.properties.name)) {
                // @ts-ignore
                showYamataiColors.value ? highlightRegion(mapGroup!, d.properties.name) : highlightRegion(mapGroup!, d.properties.name, true, yamataiColor)
            }
        });
    // 如果不显示地名，并且为邪马台颜色，则不显示邪马台的名字
    if (showYamataiColors.value && !showRegionNames.value) {
        // 将邪马台名字去掉
        labelContainers!.selectAll(".region-label")
            // @ts-ignore
            .filter(d => d.properties.chineseName == "福冈县")
            .text("邪马台")
            .transition()
            .duration(500)
            .attr("opacity", 0)

        setTimeout(() => {
            labelContainers!.selectAll(".region-label")
                // @ts-ignore
                .filter(d => d.properties.chineseName == "福冈县")
                .text("邪马台")
                .attr("opacity", 0)
                .attr("x", () => 0)
                .attr("y", () => 0);
        }, 500)
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

// 显示近畿邪马台/大和
const showJinji = ref(false)
const jinjiColor = "#9c27b0"
const jinjiList = ["Kyoto", "Osaka", "Mie", "Shiga", "Hyogo", "Nara", "Wakayama"]
/**
 * 
 * @param name 大和国/邪马台
 * @param color 如果为空，则使用近畿颜色，否则为color
 */
const toggleJinji = (name: string, color?: string) => {
    showJinji.value = !showJinji.value;
    jinjiList.forEach(item => {
        highlightRegion(mapGroup!, item, true, showJinji.value ? color || jinjiColor : defaultColor)
    })
    if (showJinji.value) {
        // 显示近畿邪马台名字
        labelContainers!.selectAll(".region-label")
            // @ts-ignore
            .filter(d => d.properties.chineseName == "大阪府")
            .text(name)
            .attr("opacity", 1)
            .attr("x", () => 5)
        // .attr("y", () => 5);
    } else {
        // 显示近畿邪马台名字
        labelContainers!.selectAll(".region-label")
            // @ts-ignore
            .filter(d => d.properties.chineseName == "大阪府")
            .text(name)
            .attr("opacity", 0)
            .attr("x", () => 0)
        // .attr("y", () => 5);
    }
}

// 大和吞并邪马台
const merge = ref(false)
const toggleMerge = () => {
    merge.value = !merge.value;
    if (merge.value) {
        // 逐步吞并中国地区，再吞并邪马台
        const mergeList = ["Okayama", "Tottori", "Shimane", "Hiroshima", "Yamaguchi"]
        const time = 500
        highlightRegion(mapGroup!, mergeList[0], true, jinjiColor)
        highlightRegion(mapGroup!, mergeList[1], true, jinjiColor)
        highlightRegion(mapGroup!, "Fukui", true, jinjiColor)
        highlightRegion(mapGroup!, "Aichi", true, jinjiColor)
        setTimeout(() => {
            highlightRegion(mapGroup!, mergeList[2], true, jinjiColor)
            highlightRegion(mapGroup!, mergeList[3], true, jinjiColor)
            highlightRegion(mapGroup!, "Ishikawa", true, jinjiColor)
            highlightRegion(mapGroup!, "Shizuoka", true, jinjiColor)
            highlightRegion(mapGroup!, "Yamanashi", true, jinjiColor)
            setTimeout(() => {
                highlightRegion(mapGroup!, mergeList[4], true, jinjiColor)
                setTimeout(() => {
                    highlightRegion(mapGroup!, "Fukuoka", true, jinjiColor)
                    highlightRegion(mapGroup!, "Toyama", true, jinjiColor)
                    highlightRegion(mapGroup!, "Saitama", true, jinjiColor)
                    highlightRegion(mapGroup!, "Tokyo", true, jinjiColor)
                    highlightRegion(mapGroup!, "Kanagawa", true, jinjiColor)
                    highlightRegion(mapGroup!, "Chiba", true, jinjiColor)
                    const regex = /(大分|福岡).*区/;
                    setTimeout(() => {
                        mapGroup!.selectAll(".region")
                            .each(d => {
                                // @ts-ignore
                                if (regex.test(d.properties.name)) {
                                    showYamataiColors.value = false;
                                    labelContainers!.selectAll(".region-label")
                                        // @ts-ignore
                                        .filter(d => d.properties.chineseName == "福冈县")
                                        .text("邪马台")
                                        .attr("opacity", 0)
                                        .attr("x", () => 0)
                                        .attr("y", () => 0);
                                    // @ts-ignore
                                    highlightRegion(mapGroup!, d.properties.name, true, jinjiColor)
                                }
                            });
                        highlightRegion(mapGroup!, "Saga", true, jinjiColor)
                        highlightRegion(mapGroup!, "Nagasaki", true, jinjiColor)
                        highlightRegion(mapGroup!, "Kumamoto", true, jinjiColor)
                        highlightRegion(mapGroup!, "Miyazaki", true, jinjiColor)
                        highlightRegion(mapGroup!, "Kagoshima", true, jinjiColor)
                        highlightRegion(mapGroup!, "Tokushima", true, jinjiColor)
                        highlightRegion(mapGroup!, "Kagawa", true, jinjiColor)
                        highlightRegion(mapGroup!, "Ehime", true, jinjiColor)
                        highlightRegion(mapGroup!, "Kochi", true, jinjiColor)
                    }, time - 200)
                }, time)
            })
        }, time)
    }
}

// 邪马台吞并大和
const remerge = ref(false)
const toggleRemerge = () => {
    remerge.value = !remerge.value;
    if (remerge.value) {
        // 逐步吞并中国地区，再吞并邪马台
        const mergeList = ["Okayama", "Tottori", "Shimane", "Hiroshima", "Yamaguchi"]
        const time = 500
        highlightRegion(mapGroup!, mergeList[4], true, yamataiColor)
        setTimeout(() => {
            highlightRegion(mapGroup!, mergeList[3], true, yamataiColor)
            highlightRegion(mapGroup!, mergeList[2], true, yamataiColor)
            setTimeout(() => {
                highlightRegion(mapGroup!, mergeList[1], true, yamataiColor)
                highlightRegion(mapGroup!, mergeList[0], true, yamataiColor)

                setTimeout(() => {
                    showJinji.value = false;
                    toggleJinji("大和国", yamataiColor)
                    highlightRegion(mapGroup!, "Fukui", true, yamataiColor)
                    highlightRegion(mapGroup!, "Aichi", true, yamataiColor)
                    highlightRegion(mapGroup!, "Ishikawa", true, yamataiColor)
                    highlightRegion(mapGroup!, "Shizuoka", true, yamataiColor)
                    highlightRegion(mapGroup!, "Yamanashi", true, yamataiColor)
                    highlightRegion(mapGroup!, "Fukuoka", true, yamataiColor)
                    highlightRegion(mapGroup!, "Toyama", true, yamataiColor)
                    highlightRegion(mapGroup!, "Saitama", true, yamataiColor)
                    highlightRegion(mapGroup!, "Tokyo", true, yamataiColor)
                    highlightRegion(mapGroup!, "Kanagawa", true, yamataiColor)
                    highlightRegion(mapGroup!, "Chiba", true, yamataiColor)
                    highlightRegion(mapGroup!, "Saga", true, yamataiColor)
                    highlightRegion(mapGroup!, "Nagasaki", true, yamataiColor)
                    highlightRegion(mapGroup!, "Kumamoto", true, yamataiColor)
                    highlightRegion(mapGroup!, "Miyazaki", true, yamataiColor)
                    highlightRegion(mapGroup!, "Kagoshima", true, yamataiColor)
                    highlightRegion(mapGroup!, "Tokushima", true, yamataiColor)
                    highlightRegion(mapGroup!, "Kagawa", true, yamataiColor)
                    highlightRegion(mapGroup!, "Ehime", true, yamataiColor)
                    highlightRegion(mapGroup!, "Kochi", true, yamataiColor)

                    // 因此 “大和” 的名字
                    setTimeout(() => {
                        labelContainers!.selectAll(".region-label")
                            // @ts-ignore
                            .filter(d => d.properties.chineseName == "大阪府")
                            .text("")
                            .attr("opacity", 0)
                            .attr("x", () => 0)
                    }, 100)
                }, time)
            }, time)
        }, time)
    }
}

// 显示三国
const showSanguo = ref(false)
const toggleSanguo = () => {
    showSanguo.value = !showSanguo.value;

    // 如果有地图了，就去掉
    if (mapGroup!.selectAll("image").size() > 0) {
        mapGroup?.selectAll(".map-image").remove()
    }
    let deleteArray = ["广东省", "云南省", "山东省", "广西壮族自治区", "上海市", "浙江省"]
    // 将deleteArray的元素从data中隐藏
    mapGroup?.selectAll(".region")
        // @ts-ignore
        .filter(d => deleteArray.includes(d.properties.name))
        .style("opacity", showSanguo.value ? 0 : 1)


    showSanguo.value &&
        mapGroup?.append("image")
            .attr("class", "map-image") // 自定义类名，用于样式控制
            .attr("xlink:href", "/sanguo1.png") // 图片URL（示例图）
            .attr("width", 1400) // 图片宽度
            .attr("transform", "rotate(8)")
            .attr("x", -880)
            .attr("y", 60.6812)
            .attr("preserveAspectRatio", "xMidYMid meet"); // 保持图片比例

}

// 显示东晋
const showDongjin = ref(false)
const toggleDongjin = () => {
    showDongjin.value = !showDongjin.value;

    // 如果有地图了，就去掉
    if (mapGroup!.selectAll("image").size() > 0) {
        mapGroup?.selectAll(".map-image").remove()
    }
    let deleteArray: Array<string> = ["云南省", "广西壮族自治区", "香港特别行政区", "云南省"]
    // 将deleteArray的元素从data中隐藏
    mapGroup?.selectAll(".region")
        // @ts-ignore
        .filter(d => deleteArray.includes(d.properties.name))
        .style("opacity", showDongjin.value ? 0 : 1)

    showDongjin.value &&
        mapGroup?.append("image")
            .attr("class", "map-image") // 自定义类名，用于样式控制
            .attr("xlink:href", "/dongjin1.png") // 图片URL（示例图）
            .attr("width", 1025) // 图片宽度
            .attr("transform", "rotate(7)")
            .attr("x", -520)
            .attr("y", 310)
}

// 显示刘宋
const showLiusong = ref(false)
const toggleLiusong = () => {
    showLiusong.value = !showLiusong.value;
    // 如果有地图了，就去掉
    if (mapGroup!.selectAll("image").size() > 0) {
        mapGroup?.selectAll(".map-image").remove()
    }
    let deleteArray = ["广西壮族自治区", "广东省", "上海市", "江苏省", "浙江省"]
    // 将deleteArray的元素从data中隐藏
    mapGroup?.selectAll(".region")
        // @ts-ignore
        .filter(d => deleteArray.includes(d.properties.name))
        .style("opacity", showLiusong.value ? 0 : 1)

    showLiusong.value &&
        mapGroup?.append("image")
            .attr("class", "map-image") // 自定义类名，用于样式控制
            .attr("xlink:href", "/liusong1.png") // 图片URL（示例图）
            .attr("width", 1295) // 图片宽度
            .attr("transform", "rotate(0)")
            .attr("x", -810)
            .attr("y", 210)
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

// 重置颜色
const resetColors = () => {
    showOptionColors.value = false;
    showYamataiColors.value = false;
    showGonugoku.value = false;
    showJinji.value = false;
    mapGroup!.selectAll(".region")
        .transition()
        .duration(500)
        .attr("fill", defaultColor);
    showSanguo.value = true;
    toggleSanguo()
    showDongjin.value = true;
    toggleDongjin()
    showLiusong.value = true;
    toggleLiusong()
}

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

#shouLuoyang.active {
    background-color: #9C27B0;
    /* 紫色背景 */
    color: white;
    /* 白色文字 */
}

#showJinji.active {
    background-color: #009688;
    /* 绿色背景 */
    color: white;
    /* 白色文字 */
}

#showSanguo.active {
    background-color: #FFC107;
    /* 黄色背景 */
    color: white;
    /* 白色文字 */
}

#showDongjin.active {
    background-color: #795548;
    /* 棕色背景 */
    color: white;
    /* 白色文字 */
}

#showLiusong.active {
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