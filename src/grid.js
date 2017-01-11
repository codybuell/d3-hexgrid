// objects we will need
// grid
// game state
// components

// todo
// - ability to define board size by target width? have radius calculated based on rows & cols desired, easier to fit on page?


// Hex Corner
//
// Calculates coordinates of corner for specified hexagon.
//
// @param {object} h - hex object {x,y,r,o}
// @param {int} i - corner desized
// @return {object} coordinate of specified corner {'x':x, 'y':y}
function hex_corner(h,i) {
  var offset    = (h.o == 'v') ? 0 : 30;
  var angle_deg = (60 * i) + offset;
  var angle_rad = Math.PI / 180 * angle_deg;
  var x = h.x + h.r * Math.cos(angle_rad);
  var y = h.y + h.r * Math.sin(angle_rad);

  return {'x':x,'y':y};
}

// Hex Points
//
// Generate array of points for a hexagon of a specified size at a given coordinate.
//
// @param {object} h - hex object {x,y,r,o}
// @return {array} points [[x,y][x,y][x,y]...]
function hex_points(h) {
  var points = [];
  for (i = 0; i < 6; i++) {
    points.push(hex_corner(h,i));
  }
  return points;
}

// Hex Path
//
// Generates svg path for a hexagon of a specified size at a given coordinate.
//
// @param {object} h - hex object {x,y,r,o}
// @return {string} svg path
function hex_path(h) {
  var points = hex_points(h);
  var d      = '';
  for (var i = 0, len = points.length; i < len; i++) {
    switch(i) {
      case 0:
        var p = 'M';
        break;
      default:
        var p = 'L';
        break;
    }
    d += p + points[i].x + ' ' + points[i].y + ' ';
  }
  d += 'Z';

  return d;
}

// Hex Polygon
//
// Generate svg polygon for a hexagon of a specified size at a given coordinate.
//
// @param {object} h - hex object {x,y,r,o}
// @return {string} svg polygon
function hex_polygon(h) {
  var p_coor = hex_points(h);
  var points = '';
  for (var i = 0, len = p_coor.length; i < len; i++) {
    points += p_coor[i].x + ',' + p_coor[i].y + ' ';
  }
  return points;
}

// Generate Offset Hex Grid Centroids
//
// Function to generate centroid coordinates for offset hex grid.
//       __    __
//    __/  \__/  \  <--- 4 x 2
//   /  \__/  \__/
//   \__/  \__/  \
//   /  \__/  \__/
//   \__/  \__/
//
// @param {int} w - width of grid
// @param {int} h - height of grid
// @param {int} m - margin around hex board
// @param {int} r - radius of hexagons
// @param {string} o - orientation of hex [h(horizontal - default) or v(vertical)]
// @param {string} c - coordinate offset type [even (default) or odd]
// @return {object}
function gen_offset_hex_grid_centroids(w,h,m,r,o,c) {

  // if vertical render top to botton left to right
  if (o == "v") {
    // if even offset, second column will start above origin
    if (c == "even") {
      var origin = {
        "x": r + m,
        "y": (Math.sqrt(3)*r) + m
      };
    // if odd offset, second column will start below origin
    } else {
      var origin = {
        "x": r + m,
        "y": ((Math.sqrt(3)*r)/2) + m
      };
    }
  // if horizontal render left to right top to bottom
  } else {
    // if even offset, second row will start left of origin
    if (c == "even") {
      var origin = {
        "x": (Math.sqrt(3)*r) + m,
        "y": r + m
      };
    // if odd offset, second row  will start right of origin
    } else {
      var origin = {
        "x": ((Math.sqrt(3)*r)/2) + m,
        "y": r + m
      };
    }
  }

  // determine build order for grid, tblr (vertical) or lrtb (horizontal)
  var outerfor = (o == 'v') ? w : h;
  var innerfor = (o == 'v') ? h : w;

  // generate grid
  var grid = [];
  for (var i=0; i < outerfor; i++) {
    var offset = (c == 'odd') ? + (Math.sqrt(3) * r / 2 * (i % 2)) : - (Math.sqrt(3) * r / 2 * (i % 2));
    for (var z = 0; z < innerfor; z++) {
      var y = (o == 'v') ? (Math.sqrt(3) * r * z) + offset : (r * 3 / 2 * i);
      var x = (o == 'v') ? (r * 3 / 2 * i) : (Math.sqrt(3) * r * z) + offset;
      grid.push({
        "xc": z,                   // x hex offset coordinate
        "yc": i,                   // y hex offset coordinate
        "x" : origin.x + x,        // x hex centroid svg coordinate
        "y" : origin.y + y,        // y hex centroid svg coordinate
        "r" : r,                   // hex radius (centroid to corner)
        "o" : o                    // hex orientation v (flat top) or h (pointy top)
      });
    }
  }

  // generate board metadata
  var width  = (o == 'v') ? (w * r * 2) - ((w - 1) * r / 2) : (w * Math.sqrt(3) * r) + (Math.sqrt(3) * r / 2);
  var height = (o == 'v') ? (h * Math.sqrt(3) * r) + (Math.sqrt(3) * r / 2) : (h * r * 2) - ((h - 1) * r / 2);
  var meta = {
    "x": w,                        // number of hexes wide
    "y": h,                        // humber of hexes high
    "w": width,                    // width in px of hex grid
    "h": height,                   // height in px of hex grid
    "m": m                         // margin surrounding hex grid
  }

  return {
    "meta": meta,
    "grid": grid
  };

}

// Generate Axial Hex Grid Centroids
//
// Function to generate centroid coordinates for axial hex grid.
//       __
//    __/  \__
//   /  \__/  \  <-- board radius 1
//   \__/  \__/
//   /  \__/  \
//   \__/  \__/
//      \__/
//
// @param {int} br - radius of board
// @param {int} hr - radius of hexagons
// @param {int} m - margin around hex board
// @param {string} o - orientation of hex [h(horizontal - default) or v(vertical)]
// @return {object}
function gen_axial_hex_grid_centroids(br, hr, m,o) {
  // determine width and height of canvas
  var width  = (o == 'v') ? (br * r * 2) - ((w - 1) * r / 2) : (w * Math.sqrt(3) * r) + (Math.sqrt(3) * r / 2);
  var height = (o == 'v') ? (h * Math.sqrt(3) * r) + (Math.sqrt(3) * r / 2) : (h * r * 2) - ((h - 1) * r / 2);
  // find the center, make that the centroid for 0,0
  // for loop to add hexes...?

}

/////////// CALLS //////////////

// SVG STRUCTURE AND WHAT IS BOUND TO IT
//
//  svg
//    group.hex (bound => {h object} hexagon centriod x coord, centroid y coord, radius, orientation)
//      hexagon path
//      group.corner (bound => {array} hexagons corners coordinates)
//        circle
//        whatever...
//      group.sides (to be done still)


// generate the board
var data = gen_offset_hex_grid_centroids(14,14,10,20,"h","odd");
// var data = gen_axial_hex_grid_centroids(board radius, hex radius, board margin, orientation)

// bind the board data
var svg = d3.select('body')
  .append('svg')
    .attr('width', data.meta.w + (data.meta.m * 2))
    .attr('height', data.meta.h + (data.meta.m * 2));

var board = svg.selectAll("g")
  .data(data.grid)
  .enter().append("g")
    .attr('class','hex');
    // .attr('id', function(d) { return d.xc + '-' + d.yc; });

// append the hexagons using path method
board.append('path')
    .attr('d', function(d) { return hex_path(d); })
    .on('click', function(d) { return console.log(d); });

// append the hexagons using polygon method
// board.append('polygon')
//     .attr('points', function(d) { return hex_polygon(d); });

// bind hex points data to a sub group in each hexagon group
var meta = board.selectAll('g')
  .data(function(d) { return hex_points(d); })
  .enter().append('g')
    .attr('class','corners');

meta.append('circle')
    .attr('cx', function(d) {return d.x;})
    .attr('cy', function(d) {return d.y;})
    .attr('stroke', 'indianred')
    .attr('fill', 'white')
    .attr('r', 3);

// meta.append('text')
//     .attr('x', function(d) {return d.x + 7;})
//     .attr('y', function(d) {return d.y + 5;})
//     .attr('fill', 'green')
//     .text(function(d,i) {return i;});
