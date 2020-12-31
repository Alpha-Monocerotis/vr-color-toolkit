<template>
  <div class="dash-board">
    <Chart ref="chart" class="chart"/>
    <div style="padding-top: 100px; padding-left:80px;"> 
        <Photoshop  v-model="colors" v-if="showColorPicker"/>
    </div>
  </div>
</template>

<script>
import Chart from './Chart.vue'
import { Photoshop } from 'vue-color'

export default {
    name: "Dashboard",
    components: { 
        Chart,
        Photoshop,
    },
    data() {
        return { 
            showColorPicker: true,
            colors: {
                hex: '#194d33',
                hsl: { h: 150, s: 0.5, l: 0.2, a: 1 },
                hsv: { h: 150, s: 0.66, v: 0.30, a: 1 },
                rgba: { r: 25, g: 77, b: 51, a: 1 },
                a: 1
            },
            selectedId: 0
        }
    },
    watch: {
        colors: {
            handler(val) {
                if(val.rgba)
                    this.$bus.emit('nodeColorChanged', val.rgba, this.selectedId);
            },
            deep: true,
            immediate: true
        }
    },
    mounted() {
        this.$bus.on('selectNode', this.handleSelectNode);
    },
    beforeDestroy() {
        this.$bus.off('selectNode', this.handleSelectNode);
    },
    methods: {
        init() {
            this.$refs['chart'].init();
        },
        rgb2hex(r, g, b) {
            return "#" + r.toString(16) + g.toString(16) + b.toString(16);
        },
        handleSelectNode(val) {            
            this.colors = this.rgb2hex(val.r, val.g, val.b);
            this.selectedId = val.id;
            console.log(this.colors, this.selectedId);
        }
    }



}
</script>

<style lang="less" scoped>
chart { 
    width: 40vw;
    height: 40vh;
}
dash-board {
    display: flex;
    flex-direction: column;
}

</style>