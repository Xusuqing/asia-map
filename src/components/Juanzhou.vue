<template>
    <div class="scroll-page">
        <div class="container">
            <!-- 控制按钮 -->
            <div class="button-container">
                <button @click="toggleScroll" class="scroll-button">
                    <i :class="isExpanded ? 'fa fa-fold mr-2' : 'fa fa-unfold mr-2'"></i>
                    {{ isExpanded ? '收起卷轴' : '展开卷轴' }}
                </button>
            </div>

            <!-- 卷轴容器 -->
            <div class="scroll-container">
                <!-- 卷轴内容 -->
                <div id="scrollContent" class="scroll-content" :style="{ opacity: contentOpacity }">
                    <div class="content-inner">
                        <p class="content-text">
                        </p>
                    </div>
                </div>

                <!-- 左侧卷轴 -->
                <div id="leftScroll" class="left-scroll scroll-part" :style="{ transform: `scaleX(${leftScale})` }">
                </div>

                <!-- 右侧卷轴 -->
                <div id="rightScroll" class="right-scroll scroll-part" :style="{ transform: `scaleX(${rightScale})` }">
                </div>

                <!-- 卷轴中心轴 -->
                <div class="scroll-spindle"></div>
            </div>
        </div>
    </div>
</template>

<script>
export default {
    data() {
        return {
            isExpanded: false,
            leftScale: 0,
            rightScale: 0,
            contentOpacity: 0
        };
    },
    methods: {
        toggleScroll() {
            if (this.isExpanded) {
                // 收起卷轴
                this.leftScale = 0;
                this.rightScale = 0;
                this.contentOpacity = 0;
                document.querySelector(".scroll-spindle").style.opacity = 1

            } else {
                // 展开卷轴
                this.leftScale = 1;
                this.rightScale = 1;
                // 延迟显示内容，让卷轴有展开的过程

                setTimeout(() => {
                    this.contentOpacity = 1;
                }, 500);
                document.querySelector(".scroll-spindle").style.opacity = 0
            }

            // 切换状态
            this.isExpanded = !this.isExpanded;
        }
    },
    mounted() {
        // 初始化状态
        this.leftScale = 0;
        this.rightScale = 0;
        this.contentOpacity = 0;
        setTimeout(() => { this.toggleScroll() }, 1000)
    }
};
</script>

<style scoped>
/* 基础样式转换 */
.scroll-page {
    user-select: none;
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: 1000px;
    /* background-color: #1F2937; */
    /* bg-gray-900 */
    min-height: 100vh;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 16px;
    /* p-4 */
}

.container {
    /* max-width: 960px; */
    /* max-w-5xl */
    width: 100%;
}

.button-container {
    opacity: 0;
    display: flex;
    justify-content: center;
    margin-bottom: 32px;
    /* mb-8 */
}

.scroll-button {
    background-color: #CD853F;
    /* bg-scroll-accent */
    color: #FFFFFF;
    /* text-white */
    font-weight: bold;
    /* font-bold */
    padding-top: 12px;
    /* py-3 */
    padding-bottom: 12px;
    padding-left: 32px;
    /* px-8 */
    padding-right: 32px;
    border-radius: 9999px;
    /* rounded-full */
    box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
    /* shadow-lg */
    transition: all 300ms ease;
    /* transition-all duration-300 */
    position: relative;
    z-index: 100;
    border: none;
    cursor: pointer;
}

.scroll-button:hover {
    background-color: #8B4513;
    /* hover:bg-scroll-wood */
    transform: scale(1.05);
    /* hover:scale-105 */
}

.scroll-button:focus {
    outline: none;
    /* focus:outline-none */
}

.scroll-container {
    position: relative;
    width: 100%;
    height: 655px;
    /* h-[500px] */
    overflow: hidden;
}

.scroll-content {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    /* inset-0 */
    background-color: #F5F0E1;
    /* bg-scroll-paper */
    padding: 32px;
    /* p-8 */
    transition: opacity 1000ms ease;
    /* transition-opacity duration-1000 */
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 31;
    background-image: url('../assets/花.jpg');
    background-size: cover;
    background-blend-mode: overlay;
}

.content-inner {
    text-align: center;
    /* text-center */
    max-width: 640px;
    /* max-w-3xl */
}

.content-title {
    font-size: 36px;
    /* text-3xl */
    font-weight: bold;
    /* font-bold */
    color: #8B4513;
    /* text-scroll-wood */
    margin-bottom: 24px;
    /* mb-6 */
}

.content-text {
    color: #1F2937;
    /* text-gray-800 */
    line-height: 1.625;
    /* leading-relaxed */
    margin-bottom: 16px;
    /* mb-4 */
}

.content-text:last-child {
    margin-bottom: 0;
}

.scroll-part {
    position: absolute;
    top: 0;
    height: 100%;
    width: 50%;
    /* w-1/2 */
    background-color: #8B4513;
    /* bg-scroll-wood */
    z-index: 20;
    transition: all 1.5s cubic-bezier(0.34, 1.56, 0.64, 1);
    /* scroll-transition */
    background-image: url('https://picsum.photos/id/129/200/400');
    background-size: cover;
    background-blend-mode: overlay;
}

.left-scroll {
    left: 0;
    transform-origin: right;
    /* origin-right */
    border-left: 12px solid #CD853F;
}

.right-scroll {
    right: 0;
    transform-origin: left;
    border-right: 12px solid #CD853F;
    /* origin-left */
}

.scroll-spindle {
    position: absolute;
    top: 0;
    left: 50%;
    transform: translateX(-50%);
    /* transform -translate-x-1/2 */
    height: 100%;
    width: 24px;
    /* w-6 */
    background-color: #CD853F;
    /* bg-scroll-accent */
    z-index: 30;
}

.content-inner {
    writing-mode: vertical-rl;
    font-size: 26px;
}
</style>
