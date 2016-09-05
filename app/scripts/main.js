/*globals $:false, d3:false */
'use strict';

(function() {

  var self = this;
  self.bubble = self.bubble || {};

  var options = {
    cellHeight: 80,
    verticalMargin: 10
  };
  $('.grid-stack').gridstack(options);
  $('.grid-stack').on('resizestop', function (event) {
    if ($(event.target).hasClass('graph-container')) {
      draw(resizeSVG(container));
    }
  });

  var container = d3.select('.svg-container');
  var format = d3.format(',d'),
    color = d3.scale.category20c();

  var bubble = d3.layout.pack()
    .sort(null)
    .padding(1.5);


  function resizeSVG(container) {
    var currentSvg = container.select('svg');
    if (!currentSvg.empty()) {
      currentSvg.remove();
    }
    currentSvg = container.append('svg')
      .attr('class', 'bubble');
    var wh = self.bubble.utils.getWidthHeight(container);
    var diameter = Math.min(wh.width, wh.height);
    currentSvg.attr('width', diameter).attr('height', diameter);
    bubble.size([diameter, diameter]);
    container.style('height', diameter + 'px');
    container.style('width', diameter + 'px');
    return currentSvg;
  }

  // Define the div for the tooltip
  var tooltipDiv = d3.select("body").append("div")
    .attr("class", "tooltip")
    .style("opacity", 0);

  d3.json('data/data.json', function(error, root) {
    if (error) {
      throw error;
    }
    root = self.bubble.utils.modify(root);
    self.bubble.root = root;
    draw(resizeSVG(container));
  });

  function draw(svg) {
    var node = svg.selectAll('.node')
        .data(bubble.nodes(classes(self.bubble.root))
        .filter(function(d) { return !d.children; }))
      .enter().append('g')
        .attr('class', 'node')
        .attr('transform', function(d) { return 'translate(' + d.x + ',' + d.y + ')'; });

    //var title = node.select('title')
    //if (title.empty()) {
      //title = node.append('title');
    //}
    //title.text(function(d) { return d.className + ': ' + format(d.value); });

    var circle = node.select('circle')
    if (circle.empty()) {
      circle = node.append('circle');
    }
    circle
      .attr('r', function(d) { return d.r; })
      .style('fill', function(d) { return color(d.packageName); })
      .on("mouseover", function(d) {
        console.log(d);
        tooltipDiv.transition()
            .duration(100)
            .style("opacity", .9);
        var html = "<h4>" + d.packageName + "</h4>";
        if (d.positive) {
            html += "<p> Positive : " + d.positive + "</p>";
        }
        if (d.negative) {
            html += "<p> Negative : " + d.negative + "</p>";
        }
        tooltipDiv.html(html)
          .style("left", (d3.event.pageX) + "px")
          .style("top", (d3.event.pageY - 28) + "px");
      })
      .on("mouseout", function(d) {
        tooltipDiv.transition()
          .duration(100)
          .style("opacity", 0);
      });

    var text = node.select('text')
    if (text.empty()) {
      text = node.append('text');
    }
    text.attr('dy', '.3em')
      .style('text-anchor', 'middle')
      .text(function(d) { return d.className.substring(0, d.r / 3); });
  }

  // Returns a flattened hierarchy containing all leaf nodes under the root.
  function classes(root) {
    var classesArr = [];

    function recurse(name, node) {
      if (node.children) {
        node.children.forEach(function(child) { recurse(node.name, child); });
      } else {
        classesArr.push({
          packageName: name,
          className: node.name,
          positive: node.positive,
          negative: node.negative,
          value: node.size
        });
      }
    }

    recurse(null, root);
    return {children: classesArr};
  }


}).call(window);
