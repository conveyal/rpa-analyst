/*
  D3.js GrepgoGraphs
*/

// TODO: use namespaced class names!

d3.grepgoGraphCircle = function module() {
  "use strict";

  // Public variables width default settings
  var width = 300;

  // Private variables
  var padding = 7,
      radius = width / 2 - padding * 2,
      gap = 8,
      color = d3.scale.category10(),
      
      proportionalRadius = function(d) {
        var a = Math.PI * (Math.pow(radius, 2) - Math.pow(gap, 2)) / d.data.total;
        return Math.sqrt(d.data.value * a / Math.PI + Math.pow(gap, 2));
      },
      
      pie = d3.layout.pie()
          .sort(null)
          .value(function(d) { return d.total; }),
      
      piePiece = d3.svg.arc()
          .outerRadius(proportionalRadius)
          .innerRadius(gap),
          
      circle = d3.svg.arc()
          .outerRadius(radius + 2)
          .startAngle(0)
          .endAngle(2 * Math.PI),
          
      proportionalCircle = d3.svg.arc()
          .outerRadius(proportionalRadius)
          .innerRadius(proportionalRadius)
          .startAngle(function(d) { return d.startAngle; })
          .endAngle(function(d) { return d.endAngle; });      

  function grepgoGraphCircle(selection) {
    var height = width;
    
    // Graph - enter
    selection.enter()
      .append('div')
        .attr('class', 'grepgo-graph')
      .append('svg')
        .attr("width", width)
        .attr("height", height)        
      .append("g")
        .attr("transform", "translate(" + (width / 2) + "," + (height / 2) + ")")
      .append('path')
        .attr('class', 'total')
        .attr("id", "outer-circle")
        .attr('stroke', 'black')
        .attr('stroke-width', '2px')
        .attr('stroke-dasharray', '7, 7')
        .attr('stroke-linecap', 'round')
        .attr('fill', 'none')
        .attr("d", circle);
    
    // Graph - exit
    selection.exit().remove();
      
    // Graph - update
    var arc = selection.select('g').selectAll(".arc")
        .data(function(d) { return pie(d.indicator); });
      
    // TODO: this whole thing only works when selection is single element 
    // make sure everything works for selections of more elements
    
    // Arc - enter        
    var arcG = arc.enter().append("g")
        .attr('class', 'arc');
        
    arcG.append("path")
      .attr('class', 'pie-piece')       
      .attr('stroke', 'white')
      .attr('stroke-width', '2px')
      .style("fill", function(d) { return color(d.value); });

    arcG.append('path')
        .attr('class', 'total')
        .attr("id", function(d, i) { return "value-circle" + i; })
        .attr('stroke', 'none')
        .attr('fill', 'none');        

    arcG.append('text')
        .attr('dy', '1em')
        .style('text-anchor', 'middle')
        .attr('font-size', '13px')
      .append('textPath')
        .attr('class', 'value-text')
        .attr('xlink:href', function(d, i) { return "#value-circle" + i; })          
        .attr("startOffset", '25%');
                
    arcG.append('text')
        .attr('dy', '-.35em')
        .attr('font-size', '13px')
        .style('text-anchor', 'middle')
      .append('textPath')
        .attr('xlink:href', '#outer-circle')       
        .attr("startOffset", function(d) {
          var p =  (((d.endAngle + d.startAngle) / 2) / (2 * Math.PI) * 100);
          return ((p + 50) % 100) + '%';             
        })
        .text(function(d) {
          var maxLength = Math.round((d.endAngle - d.startAngle) / (Math.PI * 2) * radius);
          if (d.data.name.length > maxLength) {
            return d.data.name.substring(0, maxLength).trim() + '…';
          } else {
            return d.data.name
          }
        });        
        
    // Arc - exit
    arc.exit().remove();
    
    // Arc - update
    arc.select('.pie-piece').attr("d", piePiece)
        // .transition()
        // .duration(500)
        // .attrTween("d", function(a) {
        //   
        //     // var i = d3.interpolate(this._current, a),
        //      //     k = d3.interpolate(arc.outerRadius()(), newRadius);
        //      // this._current = i(0);
        //      // return function(t) {
        //      //     return arc.innerRadius(k(t)/4).outerRadius(k(t))(i(t));
        //      // };
        //   });

    arc.select('.total').attr("d", proportionalCircle);

    arc.select('.value-text').text(function(d) { return d.data.value; });
    
    // g.append('text')
    //     .attr('dy', '1em')
    //     .style('text-anchor', 'middle')
    //     .attr('font-size', '8px')
    //   .append('textPath')
    //     .attr('xlink:href', function(d, i) { return "#value-circle" + i; })          
    //     .attr("startOffset", '25%')
    //     .text(function(d) { return d.data.value; });
    // 

  
    // selection.each(function(d, i) {
    // });

  }    
    
  // Getter/setter functions
  grepgoGraphCircle.width = function(_) {
    if (!arguments.length) return width;
    width = _;
    return grepgoGraphCircle;
  };  

  return grepgoGraphCircle;

};    