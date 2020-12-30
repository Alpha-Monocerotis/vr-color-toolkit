<template>
  <div style="border: 1px solid #000">
    <svg ref="canvas"></svg>
  </div>

</template>

<script>
import * as d3 from 'd3';

export default {
  name: "Chart",
  data() {
    return {
      svg: null,
      dataPoints: [],
    }
  },
  mounted() {
    window.$bus = this.$bus;
    this.$bus.on('nodeColorChanged', this.handleNodeColorChanged);
  },
  beforeDestroy() {
    this.$bus.off('nodeColorChanged', this.handleNodeColorChanged);
  },
  methods: {
    init() {
      window.ws = new WebSocket("ws://localhost:8000");
      // eslint-disable-next-line no-unused-vars
      window.ws.onopen = function (e) {
        console.log('Connection to server opened');
      }
      const _this = this;
      window.ws.onmessage = function (message) {
        let presetDataPointsColor = JSON.parse(message.data)['Color']['Point'];
        let presetDataPointsA = JSON.parse(message.data)['Opacity']['Point'];
        _this.presetDataPoints = [];
        for(let i=0;i<presetDataPointsColor.length;i++) {
          _this.presetDataPoints.push({
            Index: Number(presetDataPointsA[i]['Index']),
            R: Number(presetDataPointsColor[i]['R']),
            G: Number(presetDataPointsColor[i]['G']),
            B: Number(presetDataPointsColor[i]['B']),
            A: Number(presetDataPointsA[i]['A'])
          })
        }
        _this.defineScales();
        _this.reDraw();
        
      }
      if (this.svg !== null) {
        d3.selectAll('[key=chart]').remove();
      }
      this.svg = this.$refs['canvas'];
      d3.select(this.svg)
          .attr("width", '40vw')
          .attr("height", '40vh')
          .attr("key", "chart")
          .on('click', function(d, i, group) {
              let event = {
                  x: d.layerX,
                  y: d.layerY
              }
              const {x, y} = event;
                _this.presetDataPoints.push({
                    Index : _this.invXScale(x),
                    R : 100,
                    G : 100,
                    B : 100,
                    A : _this.invYScale(y)
                });
                _this.presetDataPoints.sort((p1, p2) => {
                    return p1.Index - p2.Index;
                });
                window.ws.send(JSON.stringify(_this.presetDataPoints));
                _this.reDraw();
          });
    },
    defineScales() {
        let minIndex = Math.min.apply(null, this.presetDataPoints.map((point) => {
            return point.Index;
        }));
        let maxIndex = Math.max.apply(null, this.presetDataPoints.map((point) => {
            return point.Index;
        }));
        this.xScale = d3.scaleLinear()
            .domain([minIndex, maxIndex])
            .range([50, parseInt(window.innerWidth * 0.4) - 50]);
        this.yScale = d3.scaleLinear()
            .domain([0, 100])
            .range([parseInt(window.innerHeight * 0.4) - 50, 50]);
        this.invXScale = d3.scaleLinear()
            .domain([50, parseInt(window.innerWidth * 0.4) - 50])
            .range([minIndex, maxIndex]);
        this.invYScale = d3.scaleLinear()
            .domain([parseInt(window.innerHeight * 0.4) - 50, 50])
            .range([0, 100]);
    },
    rgb2hex(r, g, b) {
      return "#" + r.toString(16) + g.toString(16) + b.toString(16);
    },
    reDraw() {
      d3.selectAll('[key=charNode]').remove();
      d3.selectAll('[key=nodeLine]').remove();
      const _this = this;
      d3.select(this.svg).append('polyline')
      .attr("points", this.presetDataPoints.map(
          (point) => {
              return [this.xScale(point.Index), this.yScale(point.A)]
          }
      ))
      .attr('x', this.xScale(this.presetDataPoints[0].Index))
      .attr('y', this.yScale(this.presetDataPoints[0].A))
      .attr('fill', 'none')
      .attr('stroke', 'black')
      .attr("stroke-width", 5)
      .attr("key", 'nodeLine');
      for(let i=0;i<this.presetDataPoints.length;i++) {
        // eslint-disable-next-line no-unused-vars
        d3.select(this.svg).append('rect')
            .attr("x", this.xScale(this.presetDataPoints[i].Index) - 10)
            .attr("y", this.yScale(this.presetDataPoints[i].A) - 10)
            .attr("fill", this.rgb2hex(this.presetDataPoints[i]['R'], this.presetDataPoints[i]['G'], this.presetDataPoints[i]['B']))
            // .attr("fill", "#fe3ef0")
            .attr("opacity", 1)
            .attr("width", 20)
            .attr("height", 20)
            .attr("key", "charNode")
            .attr("id", i)
            .on("click", function(d, i, group) {
                window.event.stopPropagation();
                let pointID = Number(this.id);
                _this.$bus.emit("selectNode", {
                    id : pointID,
                    r : _this.presetDataPoints[pointID].R,
                    g : _this.presetDataPoints[pointID].G,
                    b : _this.presetDataPoints[pointID].B,
                    a : _this.presetDataPoints[pointID].A,
                });
            })
            .on('contextmenu', function(d, i, group) {
                window.event.preventDefault();
                let index = Number(this.id);
                _this.presetDataPoints.splice(index, 1);
                window.ws.send(JSON.stringify(_this.presetDataPoints));
                _this.reDraw();
            })
            .call(
                d3.drag()
                    .on('start', () => {})
                    .on('end', () => {})
                    .on('drag', function(d, i, group) {
                        let event = {
                            x : d.sourceEvent.layerX,
                            y : d.sourceEvent.layerY
                        }
                        const {x, y} = event;
                        // _this.$bus.emit('changeDataPoints', [this.id, x, y]);
                        if(this.id > 0 && this.id < _this.presetDataPoints.length - 1) {
                            let xx = _this.invXScale(x);
                            let low_bound_x = _this.presetDataPoints[Number(this.id) - 1].Index;
                            let high_bound_x = _this.presetDataPoints[Number(this.id) + 1].Index;
                            if (xx <= low_bound_x) xx = low_bound_x;
                            if (xx >= high_bound_x) xx = high_bound_x;
                            _this.presetDataPoints[this.id].Index = xx;
                            _this.presetDataPoints[this.id].A = _this.invYScale(y);
                        } else {
                            _this.presetDataPoints[this.id].Index = _this.invXScale(x);
                            _this.presetDataPoints[this.id].A = _this.invYScale(y);
                        }
                        _this.presetDataPoints.sort((p1, p2) => {
                            return p1.Index - p2.Index;
                        });
                        window.ws.send(JSON.stringify(_this.presetDataPoints));
                        _this.reDraw();
                    })
            );
      }
    },
    handleNodeColorChanged(val, id) {
        let {r, g, b} = val;
        this.presetDataPoints[id].R = r;
        this.presetDataPoints[id].G = g;
        this.presetDataPoints[id].B = b;
        this.reDraw();
    }
  }
}
</script>

<style scoped>

</style>