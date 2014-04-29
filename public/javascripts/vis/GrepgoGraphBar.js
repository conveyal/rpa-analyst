/*
  D3.js GrepgoGraphs
*/

// TODO: use namespaced class names!

d3.grepgoGraphBar = function module() {
  "use strict";

  // Public variables width default settings
  var width = 300;
      
  // Private variables
  var paddingLeft = 0,
      paddingRight = 50, // needed to save space for total text
      barHeight = 20,
      barGap = 30, // including text
      color = d3.scale.category10();

  function grepgoGraphBar(selection) {
        
    var height = 600;
    
    // Graph - enter
    selection.enter()
      .append('div')
        .attr('class', 'grepgo-graph')
      .append('svg')
        .attr('width', width)
        .attr('height', width)
      .append('g');
    
    // Graph - exit
    selection.exit().remove();
      
    // Graph - update
    var height = 0,
        scales = {},
        format = d3.format('ns');
    var barGroups = selection.select('g').selectAll('.bar-group')
        .data(function(d, i) {          
          height += d.indicator.length * (barHeight + barGap);          
          scales[i] = d3.scale.linear()
              .domain([0, d3.max(d.indicator, function(d) { return d.total; })])
              .range([0, width - paddingLeft - paddingRight]);
          return d.indicator;    
        });

    selection.select('svg').attr('height', height);
       
    // Bar - enter        
    
    var bagGroup = barGroups.enter().append('g')
        .attr('class', 'bar-group')
    
    bagGroup.append('rect')
        .attr('class', 'bar-total')
        .attr('fill', function(d) { return color(d.value); })
        .attr('fill-opacity', '0.2')
        .style("stroke", 'none')        
        .attr('height', barHeight + 'px')
        .attr('x', paddingLeft + 'px')
        .attr('y', function(d, i) { return i * (barHeight + barGap) + 'px'; });

    bagGroup.append('rect')
        .attr('class', 'bar')     
        .attr('stroke', 'none')
        .style("fill", function(d) { return color(d.value); })
        .attr('height', barHeight + 'px')
        .attr('x', paddingLeft + 'px')
        .attr('y', function(d, i) { return i * (barHeight + barGap) + 'px'; });
     
    bagGroup.append('text')
        .attr('x', paddingLeft + 'px')
        .style('font-size', '13px')
        .attr('y', function(d, i) { return i * (barHeight + barGap) + barHeight + 14 + 'px'; })
        .text(function(d) { return d.name; });
    
    bagGroup.append('text')
        .style('fill', '#999')
        .style('font-size', '13px')
        .attr('class', 'text-total')
        .attr('y', function(d, i) { return i * (barHeight + barGap) + 14 + 'px'; });
    
    // Bar - exit
    barGroups.exit().remove();
    
    // Bar - update
    selection.selectAll('.bar-group').each(function(d) {
      d3.select(this).select('.bar')
          .transition()
          .duration(500)
          .attr('width', function(d) { return ((scales[0])(d.value)) + 'px'; });

      d3.select(this).select('.bar-total')
          .transition()
          .duration(500)
          .attr('width', function(d) { return ((scales[0])(d.total)) + 'px'; });
        
      d3.select(this).select('.text-total')
          .transition()
          .duration(500)    
          .attr('x', function(d) { return ((scales[0])(d.total) + 5) + 'px'; })
          .text(function(d) { return format(d.total); });    
    
    
    });

  }
  
  // Getter/setter functions
  grepgoGraphBar.width = function(_) {
    if (!arguments.length) return width;
    width = _;
    return grepgoGraphBar;
  };  
  
  return grepgoGraphBar;

};    