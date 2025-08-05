import { table } from "./translate.ts";
import { ref } from "vue";
// 整体的默认颜色
let defaultColor = "#2D6A4F"; // 深绿，呼应游戏中北方“虾夷地”的苍茫感
// let defaultColor = "#fff";
// 是否显示行政区的名字
let showRegionNames = ref(false); // 是否显示行政区的名字

// 背景的颜色
let backgroundColor = "#87CEEB";

// 不需要界线的行政区
const noStrokeRegions = [
    "大分1区",
    "大分3区",
    "大分2区",
    "福岡1区",
    "福岡2区",
    "福岡3区",
    "福岡4区",
    "福岡5区",
    "福岡6区",
    "福岡7区",
    "福岡8区",
    "福岡9区",
    "福岡10区",
    "福岡11区"
];

// 悬浮时是否显示行政区的名字
let showHoverRegionNames = ref(true);


// 邪马台颜色控制
let showYamataiColors = ref(false)

// 狗奴国是否显现
let showGonugoku = ref(false)

// 是否显示个性化颜色
let showOptionColors = ref(false)
// 各个行政区的颜色
let regionColors: Record<string, string> = {
    // 北海道地方
    "Hokkaido": "#2D6A4F",    // 北海道（深绿，呼应游戏中北方“虾夷地”的苍茫感）

    // 东北地方（战国为奥羽诸藩，色调偏厚重）
    "Aomori": "#B79220",      // 青森县（土黄，相邻岩手、秋田）
    "Iwate": "#7D2E2E",       // 岩手县（暗红，与青森（土黄）不同）
    "Akita": "#2D6A4F",       // 秋田县（深绿，与青森（土黄）、岩手（暗红）不同）
    "Yamagata": "#B79220",    // 山形县（土黄，与秋田（深绿）不同）
    "Miyagi": "#2D6A4F",      // 宫城县（深绿，与岩手（暗红）不同）
    "Fukushima": "#7D2E2E",   // 福岛县（暗红，与岩手（暗红）不相邻，与山形（土黄）、宫城（深绿）不同）

    // 关东地方（战国为武田、北条等势力，色调偏鲜明）
    "Ibaraki": "#B79220",     // 茨城县（土黄）
    "Tochigi": "#2D6A4F",     // 栃木县（深绿，与茨城（土黄）不同）
    "Gunma": "#7D2E2E",       // 群马县（暗红，与栃木（深绿）不同）
    "Saitama": "#B79220",     // 埼玉县（土黄，与群马（暗红）、栃木（深绿）不同）
    "Chiba": "#2D6A4F",       // 千叶县（深绿，与埼玉（土黄）不同）
    "Tokyo": "#7D2E2E",       // 东京都（暗红，与埼玉（土黄）、千叶（深绿）不同）
    "Kanagawa": "#B79220",    // 神奈川县（土黄，与东京（暗红）不同）

    // 中部地方（战国为织田、德川核心区，色调偏沉稳）
    "Niigata": "#2D6A4F",     // 新潟县（深绿）
    "Toyama": "#7D2E2E",      // 富山县（暗红，与新潟（深绿）不同）
    "Ishikawa": "#B79220",    // 石川县（土黄，与富山（暗红）不同）
    "Fukui": "#2D6A4F",       // 福井县（深绿，与石川（土黄）不同）
    "Yamanashi": "#7D2E2E",   // 山梨县（暗红，呼应武田氏“甲斐”）
    "Nagano": "#B79220",      // 长野县（土黄，与山梨（暗红）不同）
    "Gifu": "#2D6A4F",        // 岐阜县（深绿，呼应织田氏“尾张”）
    "Shizuoka": "#7D2E2E",    // 静冈县（暗红，与岐阜（深绿）、山梨（暗红）不相邻）
    "Aichi": "#B79220",       // 爱知县（土黄，与岐阜（深绿）、静冈（暗红）不同）

    // 近畿地方（战国为京都、大阪核心，色调偏厚重）
    "Kyoto": "#2D6A4F",       // 京都府（深绿，呼应古都氛围）
    "Osaka": "#7D2E2E",       // 大阪府（暗红，与京都（深绿）不同）
    "Mie": "#B79220",         // 三重县（土黄，与大阪（暗红）不同）
    "Shiga": "#2D6A4F",       // 滋贺县（深绿，与京都（深绿）不相邻）
    "Hyogo": "#B79220",       // 兵库县（土黄，与京都（深绿）、大阪（暗红）不同）
    "Nara": "#7D2E2E",        // 奈良县（暗红，与大阪（暗红）不相邻）
    "Wakayama": "#2D6A4F",    // 和歌山县（深绿，与大阪（暗红）不同）

    // 中国地方（战国为毛利等势力，色调偏冷感）
    "Tottori": "#B79220",     // 鸟取县（土黄）
    "Shimane": "#2D6A4F",     // 岛根县（深绿，与鸟取（土黄）不同）
    "Okayama": "#7D2E2E",     // 冈山县（暗红，与岛根（深绿）不同）
    "Hiroshima": "#B79220",   // 广岛县（土黄，与冈山（暗红）、岛根（深绿）不同）
    "Yamaguchi": "#2D6A4F",   // 山口县（深绿，与广岛（土黄）不同）

    // 四国地方（战国为长宗我部等势力，色调偏明快）
    "Tokushima": "#7D2E2E",   // 德岛县（暗红）
    "Kagawa": "#2D6A4F",      // 香川县（深绿，与德岛（暗红）不同）
    "Ehime": "#B79220",       // 爱媛县（土黄，与德岛（暗红）、香川（深绿）不同）
    "Kochi": "#7D2E2E",       // 高知县（暗红，与德岛（暗红）不相邻、与爱媛（土黄）不同）

    // 九州地方（战国为岛津等势力，色调偏热烈）
    "Fukuoka": "#2D6A4F",     // 福冈县（深绿）
    "Saga": "#7D2E2E",        // 佐贺县（暗红，与福冈（深绿）不同）
    "Nagasaki": "#B79220",    // 长崎县（土黄，与佐贺（暗红）不同）
    "Kumamoto": "#DDA0DD",    // 熊本县（深绿，与福冈（深绿）不相邻）
    "Oita": "#7D2E2E",        // 大分县（暗红，与熊本（深绿）不同）
    "Miyazaki": "#B79220",    // 宫崎县（土黄，与熊本（深绿）、大分（暗红）不同）
    "Kagoshima": "#2D6A4F",   // 鹿儿岛县（深绿，呼应岛津氏，与宫崎（土黄）不同）

    // 冲绳县（偏异域感）
    "Okinawa": "#7D2E2E",      // 冲绳县（暗红，与其他县无相邻）

    // "Gwangju": "red",

    // 邪马台分区
    "大分1区": "#8B4513",
    "大分3区": "#006400",
    "大分2区": "#4682B4",
    "福岡1区": "#CD5C5C",
    "福岡2区": "#DAA520",
    "福岡3区": "#9370DB",
    "福岡4区": "#20B2AA",
    "福岡5区": "#F0E68C",
    "福岡6区": "#FF6347",
    "福岡7区": "#98FB98",
    "福岡8区": "#DDA0DD",
    "福岡9区": "#87CEEB",
    "福岡10区": "#FFA500",
    "福岡11区": "#7B68EE"


};


// 1. 定义一个函数，用于单独改变特定地区的颜色
/**
 * 
 * @param {*} mapGroup 
 * @param {*} chineseName 
 * @param {*} returnFlag 是否还原颜色
 * @param {*} defaultColor 默认的颜色
 */
function highlightRegion(mapGroup: d3.Selection<SVGGElement, unknown, HTMLElement, any>, name: string, returnFlag?: boolean, defaultColor?: string) {
    // 选择目标区域
    const targetRegion = mapGroup.select(`.region[data-name="${table[name] || name}"]`);

    if (!targetRegion.empty()) {
        // 应用新颜色，带过渡动画
        targetRegion.transition()
            .duration(500)
            .attr("fill", () => returnFlag ? defaultColor as string : regionColors[name] || defaultColor as string)
    } else {
        console.warn(`未找到地区: ${name}`);
    }
}

export {
    defaultColor,
    showRegionNames,
    backgroundColor,
    noStrokeRegions,
    showHoverRegionNames,
    regionColors,
    showYamataiColors,
    showGonugoku,
    showOptionColors,
    highlightRegion
}
