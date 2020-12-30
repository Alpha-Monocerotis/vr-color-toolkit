<template>
  <div class="dash-board">
    <Chart ref="chart" style="width: 40vw; height: 40vh;"/>
    <Photoshop class="color-picker" v-model="colors" v-if="showColorPicker"/>
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
            colors: "#ffeefe",
            selectedId: 0
        }
    },
    watch: {
        colors(val) {
            this.$bus.emit('nodeColorChanged', val.rgba, selectedId);
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
        selectNode(val) {
            this.color = {
                r: val.r,
                g: val.g,
                b: val.b,
                a: 1
            };
            this.selectedId = val.id;
        }
    }



}
</script>

<style lang="less" scoped>
dash-board {
    display: flex;
    flex-direction: column;
}
color-picker {
  position: r;
}
</style>