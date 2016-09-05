/*globals $:false, d3:false */
'use strict';

$.getScript('/bower_components/d3/d3.js').done(function() {

  var self = window;
  self.bubble = self.bubble || {};
  self.bubble.utils = {};

  /**
   * Takes a data node with positive and negative attributes and calculates the
   * size of the node
   *
   * @param node data node with positive and negative attributes
   * @return size of the node ( to be used to draw a bubble)
   */
  function sizeOf(node) {
    return (node.positive || 0) - (node.negative || 0);
  }
  self.bubble.utils.sizeOf = sizeOf;

  /**
   * Modifies the json data
   * @param data the loaded data from .json file
   * @return data with the structure
   * {
   *   value:  value,
   *   lng:  longitude_coordinates,
   *   lat:  latitude_coordinates,
   *   time: timestamp
   * }
   */
  self.bubble.utils.modify = function (data) {
    var children = [];
    var newData = {
      name: 'Bubble Chart',
      children: children
    };
    $.each(data, function(k, v) {
      children.push({
        name: k,
        children: [{
          name: k,
          size: Math.abs(sizeOf(v)),
          isNegative: sizeOf(v) < 0,
          negative: v.negative,
          positive: v.positive
        }]
      });
    });
    console.log(newData);
    return newData;
  };

  /**
   * Gets the width and height of the parent node of the element passed
   */
  self.bubble.utils.getWidthHeight = function(element) {
    var node = element.node().parentNode;
    return {
      width: node.offsetWidth,
      height: node.offsetHeight
    };
  };

  var container = d3.select('.svg-container');
  var positiveColor = d3.scale.linear().domain([1,300])
      .interpolate(d3.interpolateHcl)
      .range([d3.rgb('#95DB33'), d3.rgb('#95DB33')]),
    negativeColor = d3.scale.linear().domain([1,300])
      .interpolate(d3.interpolateHcl)
      .range([d3.rgb('#001E38'), d3.rgb('#001E38')]);

  var bubble = d3.layout.pack()
    .sort(null)
    .padding(1.5);

  function resizeSVG(container) {
    var currentSvg = container.select('svg');
    if (!currentSvg.empty()) {
      currentSvg.remove();
    }
    currentSvg = container.append('svg').attr('class', 'bubble');
    var wh = self.bubble.utils.getWidthHeight(container);
    var diameter = Math.min(wh.width, wh.height);
    currentSvg.attr('width', diameter).attr('height', diameter);
    bubble.size([diameter, diameter]);
    container.style('height', diameter + 'px');
    container.style('width', diameter + 'px');
    return currentSvg;
  }

  // Define the div for the tooltip
  var tooltipDiv = d3.select('body').append('div')
    .attr('class', 'tooltip')
    .style('position', 'absolute')
    .style('text-align', 'left')
    .style('width', '150px')
    .style('height', '80px')
    .style('padding', '10px')
    .style('font', '12px sans-serif')
    .style('background', '#E8E8E8')
    .style('border', '0px')
    .style('border-radius', '3px')
    .style('pointer-events', 'none')
    .style('opacity', 0);

  d3.json('data/data.json', function(error, root) {
    if (error) {
      throw error;
    }
    var domain = d3.extent($.map(root, function(v) { return v; }), function(d) {
      return Math.abs(self.bubble.utils.sizeOf(d));
    });
    positiveColor.domain(domain);
    negativeColor.domain(domain);
    root = self.bubble.utils.modify(root);
    console.log(root);
    self.bubble.root = root;
    draw(resizeSVG(container));
  });

  function draw(svg) {
    var node = svg.selectAll('.node')
        .data(bubble.nodes(classes(self.bubble.root))
        .filter(function(d) { return !d.children; }))
      .enter().append('g')
        .attr('class', 'node')
        .attr('transform', function(d) {
          return 'translate(' + d.x + ',' + d.y + ')';
        });

    //var title = node.select('title')
    //if (title.empty()) {
      //title = node.append('title');
    //}
    //title.text(function(d) { return d.className + ': ' + format(d.value); });

    var circle = node.select('circle');
    if (circle.empty()) {
      circle = node.append('circle');
    }
    circle
      .attr('r', function(d) { return d.r; })
      .style('fill', function(d) {
        return d.isNegative ? negativeColor(d.value) : positiveColor(d.value) ;
      })
      .on('mouseover', function(d) {
        tooltipDiv.transition()
            .duration(100)
            .style('opacity', 0.9);
        var html = "<h4 style='margin: 0; border-bottom: 1px solid black; padding: 5px; padding-left: 5px;'>" + d.packageName + "</h4>";
        if (d.positive) {
            html += '<p> Positive : ' + d.positive + '</p>';
        }
        if (d.negative) {
            html += '<p> Negative : ' + d.negative + '</p>';
        }
        tooltipDiv.html(html)
          .style('left', (d3.event.pageX) + 'px')
          .style('top', (d3.event.pageY - 28) + 'px');
      })
      .on('mouseout', function() {
        tooltipDiv.transition()
          .duration(100)
          .style('opacity', 0);
      });

    var text = node.select('text');
    if (text.empty()) {
      text = node.append('text');
    }
    text.attr('dy', '.3em')
      .style('fill', function(d) {
        return d.isNegative ? 'white' : 'black' ;
      })
      .style('font', '10px sans-serif')
      .style('pointer-events', ' none')
      .style('text-anchor', 'middle')
      .text(function(d) {
        return d.className.substring(0, d.r / 3);
      });
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
          isNegative: node.isNegative,
          value: node.size
        });
      }
    }

    recurse(null, root);
    return {children: classesArr};
  }

});
