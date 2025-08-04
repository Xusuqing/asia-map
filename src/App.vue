<template>
  <div class="controls">
    <button id="rotate-left">向左旋转</button>
    <button id="rotate-right">向右旋转</button>
    <button id="reset-rotation">重置旋转</button>
    <button id="showHoverNames" :class="{ active: showHoverRegionNames }">悬浮显示名字</button>
    <button id="copy-location">复制位置信息</button>
    <button id="jump-to-location">跳转位置</button>
    <Episode1 v-if="mapGroup" :mapGroup="mapGroup" :labelContainers="labelContainers"></Episode1>
    <SelectBorder />
  </div>
  <div class="map-container" id="map"></div>
  <div class="tooltip" id="tooltip" style="opacity: 0;"></div>

</template>

<script setup lang="ts">
import SelectBorder from './components/SelectBorder/index.vue'
import * as d3 from 'd3'
import { backgroundColor, showOptionColors, regionColors, defaultColor, noStrokeRegions, showHoverRegionNames, showRegionNames } from "./config/config"
// import { japanJson } from './assets/japan';
import { asiaJson } from './config/translate';
import { reactive, onMounted, type Reactive, ref, type Ref } from 'vue';
import Episode1 from './components/Episode-1/index.vue'
// @ts-ignore
let mapGroup: Ref<d3.Selection<SVGGElement, unknown, HTMLElement, any>> = ref()
// @ts-ignore
let labelContainers: Reactive<d3.Selection<SVGGElement, {
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
}, SVGGElement, unknown>> = reactive({})
// @ts-ignore
const path: Ref<d3.GeoPath<any, d3.GeoPermissibleObjects>> = ref()
// 初始化旋转角度
const rotationAngle = ref(0);
onMounted(() => {

  // 设置地图容器尺寸
  const width = window.innerWidth;
  const height = window.innerHeight;

  // 创建SVG元素
  const svg = d3.select("#map")
    .append("svg")
    .attr("width", width)
    .attr("height", height);

  // 添加海蓝色背景
  svg.append("rect")
    .attr("width", width)
    .attr("height", height)
    .attr("fill", backgroundColor); // 海蓝色


  let isRotating = false; // 旋转状态标志

  // 创建地图投影（针对日本区域调整）
  const projection = d3.geoMercator()
    .center([138.3833, 35.6833]) // 日本中心
    .scale(2000)
    .translate([width / 2, height / 2]);

  // 创建路径生成器
  path.value = d3.geoPath()
    .projection(projection);

  // 创建缩放行为
  const zoom = d3.zoom()
    .scaleExtent([0.5, 30]) // 设置缩放范围
    .on("zoom", zoomed);

  // 应用缩放行为到SVG
  // @ts-ignore
  svg.call(zoom);

  // 创建地图组元素，用于缩放和平移
  const zoomGroup = svg.append("g")
    .attr("id", "zoom-group");

  // 创建地图组元素，用于旋转
  mapGroup.value = zoomGroup.append("g").attr("id", "map-group");

  // 使用更合适的示例GeoJSON数据
  const geojsonData = asiaJson

  // 自定义标签偏移量
  const labelOffsets: Record<string, Array<number>> = {
    "Kochi": [0, -4],
    "Tokyo": [0, -23] // 调整东京标签的位置
  };
  // 添加区域
  mapGroup.value!.selectAll(".region")
    .data(geojsonData.features)
    .enter().append("path")
    .attr("class", "region")
    // @ts-ignore
    .attr("d", path.value)
    // @ts-ignore
    .attr("fill", (d: { properties: { name: any; }; }) => showOptionColors.value ? regionColors[d.properties.name!] || defaultColor : defaultColor) // 应用自定义颜色
    // @ts-ignore
    .attr("data-name", d => d.properties.chineseName || d.properties.name)
    // @ts-ignore
    .attr("stroke-width", (d: { properties: { name: string; }; }) => noStrokeRegions.includes(d.properties.name!) ? 0 : 0.1) // 根据区域名称决定是否显示边框
    // 添加交互
    // @ts-ignore
    .on("mouseover", function (event: { pageX: number; pageY: number; }, d: { properties: { chineseName: any; name: string | d3.ValueFn<d3.BaseType, unknown, string | null> | null; }; }) {
      if (showHoverRegionNames.value) {
        d3.select("#tooltip")
          .style("opacity", 1)
          .html(d.properties.chineseName || d.properties.name!)
          .style("left", (event.pageX + 10) + "px")
          .style("top", (event.pageY - 28) + "px");
      }
    })
    .on("mouseout", function () {
      d3.select("#tooltip")
        .style("opacity", 0);
    })
    .on("click", function (d) {
      console.log(d);
    })
    ;

  // 添加区域标签容器
  labelContainers = mapGroup.value.selectAll(".label-container")
    .data(geojsonData.features)
    .enter().append("g")
    .attr("class", "label-container")

  // 添加区域标签
  labelContainers.append("text")
    .attr("class", "region-label")
    .attr("dy", ".35em")
    .text(d => showRegionNames.value ? d.properties.chineseName || d.properties.name! : "");

  // 更新地图旋转（带动画效果）
  function updateRotation(targetAngle: number) {
    if (isRotating) return; // 如果正在旋转，忽略新的旋转请求

    isRotating = true;
    const startAngle = rotationAngle.value;

    // 创建过渡效果
    d3.transition()
      .duration(500) // 动画持续时间（毫秒）
      .ease(d3.easeCubicOut) // 缓动函数，使动画更自然
      .tween("rotate", () => {
        return t => {
          // 计算当前插值角度
          rotationAngle.value = startAngle + (targetAngle - startAngle) * t;

          // 更新地图旋转
          mapGroup.value.attr("transform", `rotate(${rotationAngle.value} ${width / 2} ${height / 2})`);

          // 更新标签旋转
          labelContainers.each(function (d) {
            // @ts-ignore
            const centroid = path.value.centroid(d);
            const offset = labelOffsets[d.properties.name!] || [0, 0];

            d3.select(this)
              .attr("transform", `translate(${centroid[0] + offset[0]}, ${centroid[1] + offset[1]}) rotate(${-rotationAngle.value} 0 0)`);
          });
        };
      })
      .on("end", () => {
        isRotating = false; // 旋转结束，重置状态
      });
  }

  let currentMapState = {
    k: 0, // 缩放等级
    x: 0, // 水平平移
    y: 0 // 垂直平移
  };

  // 缩放处理函数
  function zoomed(event: any) {
    zoomGroup.attr("transform", event.transform);
    // 更新缩放比例显示
    // const zoomScale = d3.zoomTransform(svg.node()).k.toFixed(2);
    // currentMapState.k = zoomScale;
    // currentMapState.x = event.transform.x;
    // currentMapState.y = event.transform.y;
  }

  // 旋转控制
  d3.select("#rotate-left").on("click", () => {
    updateRotation(rotationAngle.value - 15);
  });

  d3.select("#rotate-right").on("click", () => {
    updateRotation(rotationAngle.value + 15);
  });

  d3.select("#reset-rotation").on("click", () => {
    updateRotation(0);
  });



  // 悬浮显示名字控制
  d3.select("#showHoverNames").on("click", () => {
    showHoverRegionNames.value = !showHoverRegionNames.value;
  });

  // 复制位置信息控制
  d3.select("#copy-location").on("click", () => {
    // @ts-ignore
    currentMapState = d3.zoomTransform(svg.node());
    const locationInfo = JSON.stringify(currentMapState); // 获取位置信息的函数
    navigator.clipboard.writeText(locationInfo)
      .then(() => { })
      .catch(err => {
        console.error("复制失败:", err);
      });
  });

  // 跳转到指定位置控制
  d3.select("#jump-to-location").on("click", () => {
    svg.transition() // 添加过渡动画
      .duration(500) // 动画持续500ms
      .call(
        // @ts-ignore
        zoom.transform,
        // 根据保存的状态创建变换
        d3.zoomIdentity
          .translate(currentMapState.x, currentMapState.y)
          .scale(currentMapState.k)
      );
  });

  // 处理窗口大小调整
  window.addEventListener("resize", () => {
    const newWidth = window.innerWidth;
    const newHeight = window.innerHeight;

    svg.attr("width", newWidth)
      .attr("height", newHeight);

    // 重置投影和路径生成器
    projection
      .translate([newWidth / 2, newHeight / 2]);

    path.value.projection(projection);

    // 更新所有路径和标签位置
    // @ts-ignore
    mapGroup.value.selectAll("path").attr("d", path.value);
    updateRotation(rotationAngle.value); // 重新应用当前旋转角度
  });

  // 初始化渲染
  updateRotation(rotationAngle.value);
})
</script>

<style>
body {
  margin: 0;
  overflow: hidden;
  font-family: Arial, sans-serif;
}

.map-container {
  width: 100vw;
  height: 100vh;
}

.region {
  /* fill: #e0e0e0; */
  stroke: #999;
  /* stroke-width: 0.1; */
}

.region:hover {
  fill: #a8a8a8;
}

.region-label {
  font-size: 3px;
  text-anchor: middle;
  pointer-events: none;
  fill: #F5F5DC;
}

.tooltip {
  position: absolute;
  padding: 8px;
  background: rgba(0, 0, 0, 0.7);
  color: white;
  border-radius: 4px;
  pointer-events: none;
  font-size: 12px;
}

.controls {
  position: absolute;
  top: 10px;
  left: 10px;
  background: white;
  padding: 10px;
  border-radius: 5px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  z-index: 100;
}

button {
  margin: 5px;
  padding: 5px 10px;
  cursor: pointer;
}

#showHoverNames.active {
  background-color: #9C27B0;
  /* 紫色背景 */
  color: white;
  /* 白色文字 */
}
</style>
