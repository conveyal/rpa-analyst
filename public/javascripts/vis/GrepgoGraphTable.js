/*
  D3.js GrepgoGraphs
*/

d3.grepgoGraphTable = function module() {
  "use strict";

  // Public variables width default settings
  var width = 300;

  // Private variables
  var height = width,
      color = d3.scale.category10();

  function grepgoGraphTable(selection) {
    
    // Graph - enter
    selection.enter()
      .append('div')
        .attr('class', 'grepgo-graph')
      .append('table')
        .attr('class', 'grepgo-graph-table');
    
    // Graph - exit
    selection.exit().remove();
      
    // Graph - update
    var rows = selection.select('table').selectAll('tr')
        .data(function(d) { return d.indicator; });

    // Row - enter
    rows.enter()
      .append('tr')
        .each(function(d) {

          d3.select(this).append('td')
              .attr('class', 'grepgo-graph-table-row-color')
            .append('div')
              .style('background-color', color(d.value));
              
          d3.select(this).append('td')
              .html(d.name);
              
          d3.select(this).append('td')
              .attr('class', 'grepgo-graph-table-row-value');

          d3.select(this).append('td')
              .attr('class', 'grepgo-graph-table-row-percentage');              

        });
    
    // Row - exit    
    rows.exit().remove();
    
    // Row - update
    selection.selectAll('tr').each(function(d) {
      d3.select(this).select('.grepgo-graph-table-row-value')
        .html(d.value ? d.value : 0);
      d3.select(this).select('.grepgo-graph-table-row-percentage')
        .html('(' + (d.value ? Math.round(d.value/d.total * 100) : 0) + '%)');
    });
    
  }
  
  // Getter/setter functions
  grepgoGraphTable.width = function(_) {
    if (!arguments.length) return width;
    width = _;
    return grepgoGraphTable;
  }; 
  
  return grepgoGraphTable;

};