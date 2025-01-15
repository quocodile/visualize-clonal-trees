
var tree1TextArea = document.querySelector("#t1-manual-edit-textarea");
var tree2TextArea = document.querySelector("#t2-manual-edit-textarea");
var tree1file = document.getElementById("file1");
var tree2file = document.getElementById("file2");
var inputTypeTree1 = document.getElementById("input-type-tree1");
var inputTypeTree2 = document.getElementById("input-type-tree2");
var submitTreesBtn = document.getElementById("submit-trees-btn");
var distanceMetric = document.getElementById("distance_metric");
var demoTreesBtn = document.getElementById("demo-trees-btn");
var coloring = ['#deebf7', '#6baed6', '#2171b5', '#08306b'];
var coloring_gt = ['#fee5d9','#fcae91', '#fb6a4a', '#cb181d'];

var no_contribution_color = "black";
var contribution_color = "#DD6503";
var highlight_color = "red";
var mutation_table_color = "black";

var heatMapFontSize = 0;



//window.addEventListener('resize', submit_tree(), true)

var gtOption = document.getElementById("ground_truth");

var font_link = document.createElement('link');
font_link.setAttribute('rel', 'stylesheet');
font_link.setAttribute('type', 'text/css');
font_link.setAttribute('href', 'https://fonts.googleapis.com/css2?family=Red+Hat+Mono:ital,wght@0,609;1,609&family=Roboto+Flex:opsz,wght@8..144,100..1000&family=Roboto+Mono:ital,wght@0,100..700;1,100..700&display=swap');
document.head.appendChild(font_link);

var tree1_filename;
var tree2_filename;


initialize();
/*
window.onload = () => {
  submit_tree();
}
*/

function closeManualEditModal() {
  document.getElementById("modal-container").style.display = "none";
  document.getElementById("t1-manual-edit-textarea").style.display = "none";
  document.getElementById("t2-manual-edit-textarea").style.display = "none";
}

function initialize() {
  /* Setting the texture legends */
  texture_legends = document.querySelectorAll(".texture-legend");
  

  texture_legends.forEach(legend => {
    svg = d3.create('svg').attr('width', '30px').attr('height', '30px'); 
    var line_direction = "";
    if (legend.id === "t1-texture-legend") {
      line_direction = "2/8";
      var distinct = true;
    }
    else {
      line_direction = "6/8";
      var distinct = true;
    }
    const texture = textures
        .lines()
        .size(6)
        .strokeWidth(1.5)
        .orientation(line_direction)
    svg.call(texture);
    svg.append('circle').attr('r', '8px').attr('cx', '20').attr('cy', '20').attr('fill', texture.url()).attr('stroke', 'black');
    legend.appendChild(svg.node()); 
  })
  
}



/*Explanation modals*/


/* distance measure modal*/

// Get the modal
var distance_modal = document.getElementById("distance-measure-modal");

// Get the button that opens the modal
var legendExplanationButton = document.getElementById("legendExplanation");


var distance_explanation_title = document.querySelector("#distance-explanation-title");
var distance_explanation = document.querySelector("#distance-explanation");
var distance_citation = document.querySelector("#distance-citation");


// Get the <span> element that closes the modal
var distance_span = document.getElementsByClassName("close-distance")[0];

// When the user clicks on the button, open the modal
legendExplanationButton.onclick = function() {
    distance_modal.style.display = "block";

    var distance_metric_selector = document.getElementById("distance_metric");
    var distance_metric = distance_metric_selector.value;

    if (distance_metric == "parent_child_distance") {
	distance_explanation_title.innerHTML = "<b>Parent-Child (PC) distance</b>";
	distance_explanation.innerHTML = "The PC distance measure sums the number of parent-child mutation pairs that are present in one tree but not the other. In our implementation, every unique parent-child pair contributes 1 to an edge between two nodes. As a parent-child relationship involves one and only one edge, we believe that the contributions were best represented through the edges rather than the nodes. Please find the original paper <a href='https://dl.acm.org/doi/pdf/10.1145/3233547.3233584' target='_blank'>here</a>.";
	distance_citation.innerHTML = "Kiya Govek, Camden Sikes, and Layla Oesper. 2018. A Consensus Approach to Infer Tumor Evolutionary Histories. In Proceedings of the 2018 ACM International Conference on Bioinformatics, Computational Biology, and Health Informatics (BCB '18), 63–72.";
    }
    if (distance_metric == "ancestor_descendant_distance") {
	distance_explanation_title.innerHTML = "<b>Ancestor-Descendant (AD) distance</b>";
	distance_explanation.innerHTML = "The AD distance measure sums the number of ancestor-descendant mutation pairs that are present in one tree but not the other. In our implementation, each unique ancestor-descendant pair contributes 1 to the edge. The contribution of each mutation is determined by the number of contributing ancestor-descendant pairs it appears in. Please find the original paper <a href='https://dl.acm.org/doi/pdf/10.1145/3233547.3233584' target='_blank'>here</a>.";
	distance_citation.innerHTML = "Kiya Govek, Camden Sikes, and Layla Oesper. 2018. A Consensus Approach to Infer Tumor Evolutionary Histories. In Proceedings of the 2018 ACM International Conference on Bioinformatics, Computational Biology, and Health Informatics (BCB '18), 63–72.";
    }
    if (distance_metric == "incomparable_pair_recall") {
	distance_explanation_title.innerHTML = "<b>Incomparable Pair (IP) distance</b>";
	distance_explanation.innerHTML = "The IP distance measure sums the number of distinct lineage mutation pairs that are present in one tree but not the other. In our implementation, each unique pair contributes 1 to the edge. The contribution of each mutation is determined by the number of contributing pairs it appears in.  Please find the original paper here.";
	distance_citation.innerHTML = "Citation goes here.";
    }
    
}


// When the user clicks on <span> (x), close the modal
distance_span.onclick = function() {
  distance_modal.style.display = "none";
}


/* heatmap & tripartite modal */


// Get the modal
var graphs_modal = document.getElementById("graphs-modal");

// Get the button that opens the modal
var graphsExplanationButton = document.getElementById("heatmapTripartiteExplanation");


// Get the <span> element that closes the modal
var graphs_span = document.getElementsByClassName("close-graphs")[0];

// When the user clicks on the button, open the modal
graphsExplanationButton.onclick = function() {
    graphs_modal.style.display = "block";

    var heatmap_explanation = document.querySelector("#heatmap-explanation");
    var tripartite_explanation = document.querySelector("#tripartite-explanation");

    if ((tree1_filename != undefined) && (tree2_filename != undefined)) {
	heatmap_explanation.innerHTML = "Our <em>heatmap</em> (top visualization) enables easy querying of specific relationships as well as provides a summary view of all relationships. Reading down a column reflects the descendents of a mutation while row-wise reading indicates its ancestors. ";
	tripartite_explanation.innerHTML = "Our <em>tripartite graph</em> (bottom visualization) summarizes all changed relationships for each individual mutation. In it, left edges indicate ancestors to the central mutations, while the right edges are their descendants. Nodes in the center column with many radiating links are likely to be of interest.";
    }
    
}


// When the user clicks on <span> (x), close the modal
graphs_span.onclick = function() {
  graphs_modal.style.display = "none";
}

// When the user clicks anywhere outside of the modal, close it (for both modals)

window.onclick = function(event) {
    if (event.target == graphs_modal) {
	graphs_modal.style.display = "none";
    }
    if (event.target == distance_modal) {
	distance_modal.style.display = "none";
    }
}






/*modals finished*/





/*to indicate that files are being edited*/
var addAsteriskTree1 = document.querySelector("#edit-tree1-icon");

addAsteriskTree1.addEventListener("click", function() {
    
    if (tree1_filename != undefined) {

	//check if already edited
	if (tree1_filename.slice(-1) != "*") {
	    tree1_filename += "*";
	}
    }
    else {
	tree1_filename = "user_tree1";
    }
});

var addAsteriskTree2 = document.querySelector("#edit-tree2-icon");

addAsteriskTree2.addEventListener("click", function() {
    if (tree2_filename != undefined) {

	//check if already edited
	if (tree2_filename.slice(-1) != "*") {  
	    tree2_filename += "*";
	}
	
    }
    else {
	tree2_filename = "user_tree2";
    }
});




/* manually edit trees */

document.getElementById('edit-tree1-icon').onclick = () => {
  document.getElementById("modal-container").style.display = "flex";
  document.getElementById("t1-manual-edit-textarea").style.display = "block";
}

document.getElementById('edit-tree2-icon').onclick = () => {
  document.getElementById("modal-container").style.display = "flex";
  document.getElementById("t2-manual-edit-textarea").style.display = "block";
}

tree1file.addEventListener("change", function () {
    var fr = new FileReader();
 
    tree1_filename = this.files[0].name;
    
    fr.readAsText(this.files[0]);
    fr.onload = function () {
	tree1TextArea.value = fr.result
	submit_tree();
    };  
});


tree2file.addEventListener("change", function () {
  var fr = new FileReader();
    fr.readAsText(this.files[0]);

    tree2_filename = this.files[0].name;
    
    fr.onload = function () {
      tree2TextArea.value = fr.result
      submit_tree();
  };  
});








function visualize_singleview(jsonData, distance_measure, dom_data) {

    
    var t1_filename_element = document.getElementById("tree1-filename-label");

    t1_filename_element.innerHTML = tree1_filename;

    var t2_filename_element = document.getElementById("tree2-filename-label");

    t2_filename_element.innerHTML = tree2_filename;
  

  dom_data.t1_only_mutations.sort().forEach(mutation => {
      dom_data.t1_label.innerHTML +=
	  `<span style="font-family:Roboto Mono; font-weight: normal" class="${mutation}-mutation-hover-label">${mutation}</span>, `;
  })
    dom_data.t1_label.innerHTML = dom_data.t1_label.innerHTML.slice(0, -2);

    if (dom_data.t1_label.innerHTML == "") {
	dom_data.t1_label.innerHTML += '<span style="font-family:Roboto Mono; font-weight: normal">None</span>';
    }

  dom_data.t2_only_mutations.sort().forEach(mutation => {
    dom_data.t2_label.innerHTML +=  
      `<span style="font-family: Roboto Mono; font-weight: normal" class="${mutation}-mutation-hover-label">${mutation}</span>, `;
  })
    dom_data.t2_label.innerHTML = dom_data.t2_label.innerHTML.slice(0, -2);

     if (dom_data.t2_label.innerHTML == "") {
	dom_data.t2_label.innerHTML += '<span style="font-family:Roboto Mono; font-weight: normal">None</span>';
     }

    
    /* get the top contributors for each tree */

    var t1_top5array = dom_data.t1_top5.split("<br>");
    var t2_top5array = dom_data.t2_top5.split("<br>");

    var t1_top5HTML = "";
    var t2_top5HTML = "";

    for (let i = 0; i < t1_top5array.length; i++) {
	console.log(t1_top5array[i])
	
	t1_top5array[i].split(",").forEach(mutation => {
	    //mutation = mutation.trim();
	    if (mutation != "") {
		t1_top5HTML +=
		    `<span style="font-family:Roboto Mono; font-weight: normal" class="${mutation}-mutation-hover-label">${mutation}</span>, `;
	    }
  })
	t1_top5HTML = t1_top5HTML.slice(0, -2);

	t1_top5HTML += "<br>"

	console.log(t1_top5HTML)

    }

    t1_top5HTML = t1_top5HTML.slice(0, -4);
    

    //trees are identical (i.e. no contributors)
    if (t1_top5array == "") {
	t1_top5HTML += `<span style="font-family:Roboto Mono; font-weight: normal">None</span>`;
    }

    dom_data.t1_top5_label.innerHTML = t1_top5HTML;

    
    //tree 2
    for (let i = 0; i < t2_top5array.length; i++) {
	
	t2_top5array[i].split(",").forEach(mutation => {
	    if (mutation != "") {
		t2_top5HTML +=
		    `<span style="font-family:Roboto Mono; font-weight: normal" class="${mutation}-mutation-hover-label">${mutation}</span>, `;
	    }
  })
	t2_top5HTML = t2_top5HTML.slice(0, -2);

	t2_top5HTML += "<br>"

    }

    t2_top5HTML = t2_top5HTML.slice(0, -4);
    

    //trees are identical (i.e. no contributors)
    if (t2_top5array == "") {
	t2_top5HTML += `<span style="font-family:Roboto Mono; font-weight: normal">None</span>`;
    }

    dom_data.t2_top5_label.innerHTML = t2_top5HTML;


  // sizing all the divs for each mutation in the mutation venn diagram
  var venn_boxes = document.querySelectorAll("p > div");
  venn_boxes.forEach(box => {
    var text = box.querySelector("span").innerHTML;
    box.style.width = (text.length * 14) + "px";
  })

  var tree1_data = jsonData.node_contribution_dict_1;
  var tree2_data = jsonData.node_contribution_dict_2;
  var data = [tree1_data, tree2_data]
  var distance = jsonData.distance;
    

  var spans = d3.selectAll("span");

  // Events for hovering over a mutation label
  spans.on('mouseover', function(d) {
      createLinkedHighlighting(this, d.target.innerHTML)
  })
  spans.on('mouseout', function(d) {
      removeLinkedHighlighting(this, d.target.innerHTML);
  })


        let t1_max = 0;
    let t2_max = 0;
     let t1_min = Number.MAX_VALUE;
	let t2_min = Number.MAX_VALUE;



  if (distance_measure == "parent_child_distance") {

  var t_max = Math.max(max_contribution(dom_data.t1_nodes), max_contribution(dom_data.t2_nodes));
  var t1_min_cont = min_contribution(d3.filter(dom_data.t1_nodes, d => d.data.contribution != 0));
    var t2_min_cont = min_contribution(d3.filter(dom_data.t2_nodes, d => d.data.contribution != 0));

     console.log("min conts", t1_min_cont, t2_min_cont);
  var t_min = 10000000000000000000000000;
  if (t1_min_cont && t2_min_cont) {
    t_min = Math.min(t1_min_cont, t2_min_cont);
  }
  else if (t1_min_cont) {
    t_min = t1_min_cont;
  }
  else {
    t_min = t2_min_cont;
  }


      t1_max = max_contribution(dom_data.t1_nodes);
      t2_max = max_contribution(dom_data.t2_nodes);
      t1_min = t1_min_cont;
      t2_min = t2_min_cont;

      
  }

    
    if (distance_measure == "ancestor_descendant_distance" || distance_measure == "incomparable_pair_recall") {

	for (var key in dom_data.t1_edges_dict) {
	    if (dom_data.t1_edges_dict[key] > t1_max) {
		t1_max = dom_data.t1_edges_dict[key]
	    }
	}
	for (var key in dom_data.t2_edges_dict) {
	    if (dom_data.t2_edges_dict[key] > t2_max) {
		t2_max = dom_data.t2_edges_dict[key]
	    }
	}

	t_max = Math.max(t1_max, t2_max)


	for (var key in dom_data.t1_edges_dict) {
	    if (dom_data.t1_edges_dict[key] < t1_min) {
		t1_min = dom_data.t1_edges_dict[key]
	    }
	}
	for (var key in dom_data.t2_edges_dict) {
	    if (dom_data.t2_edges_dict[key] < t2_min) {
		t2_min = dom_data.t2_edges_dict[key]
	    }
	}

    t_min = Math.min(t1_min, t2_min)

    }
    

    /* defining the color scale for contributions */

    var gt_option = gtOption.value;

    if (gt_option == "no") {


	var t1_box = document.getElementById("t1-box-wrapper");
	t1_box.style.boxShadow = "inset 0 0 10px #d95f02";
	var t2_box = document.getElementById("t2-box-wrapper");
	t2_box.style.boxShadow = "inset 0 0 10px #7570b3";
	

  var color_scale = d3.scaleLinear()
  .domain([t_min, t_max/3, 2*t_max/3, t_max])
      .range([coloring[0],coloring[1], coloring[2], coloring[3]])
  .interpolate(d3.interpolateHcl);
	fill_tree_scale_color_legend(multi_tree_prefix = "", t_max, t_min, color_scale);
    }
    
    else if (gt_option == "t1") {


	var t2_box = document.getElementById("t2-box-wrapper");
	t2_box.style.boxShadow = "inset 0 0 10px red";
	var t1_box = document.getElementById("t1-box-wrapper");
	t1_box.style.boxShadow = "inset 0 0 10px lightgray";
	
	var color_scale = d3.scaleLinear()
  .domain([t2_min, t2_max/3, 2*t2_max/3, t2_max])
      .range([coloring_gt[0],coloring_gt[1], coloring_gt[2], coloring_gt[3]])
  .interpolate(d3.interpolateHcl);
	fill_tree_scale_color_legend(multi_tree_prefix = "", t2_max, t2_min, color_scale);
    }
    else { //t2

	var t1_box = document.getElementById("t1-box-wrapper");
	t1_box.style.boxShadow = "inset 0 0 10px red";
	var t2_box = document.getElementById("t2-box-wrapper");
	t2_box.style.boxShadow = "inset 0 0 10px lightgray";

	
	var color_scale = d3.scaleLinear()
  .domain([t1_min, t1_max/3, 2*t1_max/3, t1_max])
      .range([coloring_gt[0],coloring_gt[1], coloring_gt[2], coloring_gt[3]])
  .interpolate(d3.interpolateHcl);
	fill_tree_scale_color_legend(multi_tree_prefix = "", t1_max, t1_min, color_scale);
    }

  var svg1 = d3.select('#svg1');
  svg1.call(d3.zoom()
    .extent([[0, 0], [700, 700]])
    .scaleExtent([1, 8])
    .on("zoom", zoomed)
  ); 
  
  var svg2 = d3.select('#svg2')
  svg2.call(d3.zoom()
    .extent([[0, 0], [700, 700]])
    .scaleExtent([1, 8])
    .on("zoom", zoomed2)
  );
  
  function zoomed({transform}) {
    var svg1_nodes =  d3.select('#svg1 g.nodes')
    var svg1_links =  d3.select('#svg1 g.links')
    svg1_nodes
      .attr("transform", transform);  
    svg1_links
      .attr("transform", transform);
  };

  function zoomed2({transform}) {
    var svg2_nodes =  d3.select('#svg2 g.nodes')
    var svg2_links =  d3.select('#svg2 g.links')
    svg2_nodes
      .attr("transform", transform);  
    svg2_links
      .attr("transform", transform);
  };

  /* drawing the trees */

  var svg_names = ['svg1', 'svg2'];
    for (var i = 0; i < 2; i++) {

    var cur_svg = svg_names[i];
    var root = d3.hierarchy(data[i]);
    var tree = d3.tree();
    if (root.height > 5) {
      tree.nodeSize([60, 20]);
    }
    else {
      tree.nodeSize([70, 50]);
    }
    tree.separation((a, b) => 1.5);
    tree(root);
    var d3_nodes = d3.select('#' + svg_names[i] +  ' g.nodes')
    var d3_links = d3.select('#' + svg_names[i] +  ' g.links')
    var d3_text = d3_nodes.selectAll("text.mutation-label")

    /*svg1 and svg2 have the same dimensions*/  
    var svg1_info = document.getElementById('svg1');
    var svg1_width = svg1_info.width.baseVal.value;
      
    var centering_adjustment = svg1_width / 5;

    // Setting shared attributes for the links 
    d3_links.selectAll('line.link')
      .data(root.links())
      .join('line')
	    .attr("class", "link "+"tree-"+(i+1)+"-link")
      .style("transform", "translate(5, 20), scale(0.5)")
      .style("stroke-width", (d) => {
       
          if (d.target.data.contribution === 0) {
            return "2px";
          }
          return "5px";
        
      })
      .attr('x1', d =>  { return d.source.x - centering_adjustment;})
      .attr('y1', d => { return d.source.y;})
      .attr('x2', d => { return d.target.x - centering_adjustment;})
      .attr('y2', d => { return d.target.y;});

    // Set shared attributes for the nodes 
    d3_nodes.selectAll("circle.node")
      .data(root.descendants())
	    .join('circle')
	
	  .attr("class", d => {
	      let these_labels = d.data.id.split("_");
	      let classes = "node_span ";
	      for (let i = 0; i < these_labels.length; i++) {
		  classes += these_labels[i] + "-node ";
	      }

		if (dom_data.t2_only_mutations.some(mut => d.data.id.split("_").includes(mut))) {
		    classes += "t2-distinct ";
		}
		 if (dom_data.t1_only_mutations.some(mut => d.data.id.split("_").includes(mut))) {
		     classes += "t1-distinct ";
		 }
	

	classes = classes.substring(0, classes.length - 1);
	      
	      return "node " + classes;
	  })  


      .style("transform", "translate(5, 20), scale(0.5)")
      .style("stroke-width", "1px")
      .attr('cx', (d) => {return d.x - centering_adjustment;})
      .attr('cy', function(d) {return d.y;})
      .attr('r', function(d) {
          return 6;      
      })

      
       .on("mouseover", function(event, data) {
	   
	   d3.select(this).style('cursor', 'pointer').attr('r', function(d) {
		   return 10;
	   })

	   let these_labels = data.data.id.split("_");
	   for (let i = 0; i < these_labels.length; i++) {
	       createLinkedHighlighting(this, these_labels[i]);
	  
	       d3.selectAll("."+these_labels[i]+'-node').attr('r', 10).style("fill", "red");
	    }
	   
       })

	    .on("mouseout", (event,data) => {

		///distinct textures on mouse out
		
	    var line_direction = "";

	    if (event.target.classList.contains("t1-distinct")) {
		line_direction = "2/8";
	    }
	    if (event.target.classList.contains("t2-distinct")) {
		line_direction = "6/8";
	    }

	const texture = textures
	      .lines()
	      .size(6)
	      .strokeWidth(1.5)
	      .orientation(line_direction)
	    .background("lightgray");

	svg1.call(texture);
	svg2.call(texture);	    

	   d3.selectAll("."+data.data.id).attr('r', function(d) {
		   return 6;
	   })
		  
	   let these_labels = data.data.id.split("_");
	   
	   for (let i = 0; i < these_labels.length; i++) {
	       removeLinkedHighlighting(this, these_labels[i]);
	       
	       d3.selectAll("."+these_labels[i]+'-node').attr('r', 6).style('fill', function(d) {
		   if (line_direction != "") {
		       return texture.url();
		   }
		   return "lightgray";
		   
	       });
	    }    
	  })


      let font_weight_scale = d3.scaleLinear().domain([0, t_max]).range([100, 700]);

	
    // Displaying the labels for the nodes
    var labels = d3_text.data(root.descendants())
    .join("text")
	.classed("mutation-label", true)
   
    .attr("y", d => { 
      if (d.data.children == null) {
          return d.y + 20; 
      }
	return d.y - 15; 
    })

    // Making each mutation a tspan
    .selectAll("tspan")
    .data(d => {
      var str = d.data.label;
      str = remove_quotation(str);
      var lst = str.split(",");
      var newLst = [];
      lst.forEach(mutation => {
        var mutation_contribution_dict_1 = jsonData.mutation_contribution_dict_1; 
        var mutation_contribution_dict_2 = jsonData.mutation_contribution_dict_2; 
        newLst.push([mutation.trim(), d.x, d.y, mutation_contribution_dict_1, mutation_contribution_dict_2]);
      });
      return newLst;
    })
    .join('tspan')
    .attr("class", d => {
      return d[0] + "-mutation-hover-label tree-node";
    })
    .text((d, i, j) => {
      if (i == j.length - 1) {
        return d[0];
      }
      return d[0] + ",";
    })

    .style("font-size", "0.70em")
	.style("font-family", "Roboto Mono")
	    
	.style('font-weight', (d) => {

	    if (svg_names[i] == 'svg1') {
		return font_weight_scale(d[3][d[0]]["contribution"])
	    }
	    if (svg_names[i] == 'svg2') {
		return font_weight_scale(d[4][d[0]]["contribution"])
	    }

	}) 

    .style("fill", (d) => {
   
	
      var mutation_contribution_dict_1 = jsonData.mutation_contribution_dict_1; 
      var mutation_contribution_dict_2 = jsonData.mutation_contribution_dict_2; 
      if (svg_names[i] == 'svg1') {
        return no_contribution_color;
        if (mutation_contribution_dict_1[d[0]]["contribution"] > 0) {
          return contribution_color;
        }
        return no_contribution_color;
      }
      else if (svg_names[i] == "svg2") {
        return no_contribution_color;
        if (mutation_contribution_dict_2[d[0]]["contribution"] > 0) {
          return contribution_color;
        }
        return no_contribution_color;
      }
    })
    .on("click", function(event, data) {
      takeToGeneCards(data[0]);
    })
    .on("mouseover", function(event, data) {
      createLinkedHighlighting(this, data[0]); 
    }) // Here is the hover thing
    .on("mouseout", (d,i) => {
      removeLinkedHighlighting(this, i[0])
    })
      /*this is where the labels are placed*/
    .attr("x", (d, i, j) => {
      var index = i;
      if (index % 2 == 0) {
        return d[1] + 10 - centering_adjustment;
      }
      return d[1] + (j[i-1].__data__[0].length + 10) * 3.5 - centering_adjustment;
    })
    .attr("dy", (d, i, j) => {
      if (i % 2 == 0) {
        return "1.1em";
      }
    });


        var t1_max_branching_factor = get_branching_factor(dom_data.t1_nodes);
      var t1_top5_mutations = get_top_n_mutations(jsonData.mutation_contribution_dict_1, 5);
      var t2_max_branching_factor = get_branching_factor(dom_data.t2_nodes);
      var t2_top5_mutations = get_top_n_mutations(jsonData.mutation_contribution_dict_2, 5);


    if (svg_names[i] == "svg1") {
      
      fill_in_table("t1", t1_max_branching_factor, root.height, dom_data.t1_nodes.length, dom_data.t1_mutations.length, t1_top5_mutations);
    }
    else {
     
      fill_in_table("t2", t2_max_branching_factor, root.height, dom_data.t2_nodes.length, dom_data.t2_mutations.length, t2_top5_mutations);
    }

	/* set tree title colors for ground truth or not */

	let tree_titles = document.querySelectorAll(".tree-label");
	if (gt_option == "no") {
	    tree_titles[0].style.color = "#d95f02";
	    tree_titles[1].style.color = "#7570b3";
	}
	else if (gt_option == "t1") {
	    tree_titles[0].style.color = "gray";
	    tree_titles[1].style.color = "red";
	}
	else {
	    tree_titles[0].style.color = "red";
	    tree_titles[1].style.color = "gray";
	}



      
    // Set the coloring scheme based off of the distance measure
    switch (distanceMetric.value) {
      case "ancestor_descendant_distance":

	if (gt_option == "no") {
	
	edge_colored_tree_ad(d3_nodes, d3_links, t_max, t_min, color_scale, dom_data.t1_only_mutations, dom_data.t2_only_mutations, svg1, svg2, dom_data.t1_edges_dict, dom_data.t2_edges_dict, i);
	   
	}
	else {
	    
	    edge_colored_tree_ad_gt(d3_nodes, d3_links, t_max, t_min, color_scale, dom_data.t1_only_mutations, dom_data.t2_only_mutations, svg1, svg2, dom_data.t1_edges_dict, dom_data.t2_edges_dict, i, gt_option);
	}
        break;

	case "incomparable_pair_recall":

	if (gt_option == "no") {
	
	edge_colored_tree_ad(d3_nodes, d3_links, t_max, t_min, color_scale, dom_data.t1_only_mutations, dom_data.t2_only_mutations, svg1, svg2, dom_data.t1_edges_dict, dom_data.t2_edges_dict, i);
	    
	}
	else {
	    
	    edge_colored_tree_ad_gt(d3_nodes, d3_links, t_max, t_min, color_scale, dom_data.t1_only_mutations, dom_data.t2_only_mutations, svg1, svg2, dom_data.t1_edges_dict, dom_data.t2_edges_dict, i, gt_option);
	}
        break;
	
    case "parent_child_distance":

	if (gt_option == "no") {
	
            edge_colored_tree(d3_nodes, d3_links, t_max, t_min, color_scale, dom_data.t1_only_mutations, dom_data.t2_only_mutations, svg1, svg2);
	}
	else {
	    edge_colored_tree_gt(d3_nodes, d3_links, t_max, t_min, color_scale, dom_data.t1_only_mutations, dom_data.t2_only_mutations, svg1, svg2, gt_option);
	}
        break;
      default:
        console.log("Please select a valid distance measure. If you have questions email ealexander@carleton.edu");
        break;
    }
  }
}


//adapted from https://awik.io/determine-color-bright-dark-using-javascript/
function isDark(color) {

    var r, g, b, hsp;

    // RGB --> store the red, green, blue values in separate variables
        color = color.match(/^rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*(\d+(?:\.\d+)?))?\)$/);
        
    r = color[1];
    g = color[2];
    b = color[3];
    
    // equation from http://alienryderflex.com/hsp.html
    hsp = Math.sqrt(
    0.299 * (r * r) +
    0.587 * (g * g) +
    0.114 * (b * b)
    );

    if (hsp>127.5) {

        return 0; //light
    } 
    else {

        return 1; //dark
    }
}



/* with ground truth comparison */
function edge_colored_tree_gt(d3_nodes, d3_links, t_max, t_min, scale, t1_only_mutations, t2_only_mutations, svg1, svg2, gt_option) {
    
    if (gt_option == "t1") {
	
	let edge_width_scale = d3.scaleLinear().domain([t_min, t_max]).range([5, 10]);
 
	d3_nodes.selectAll('circle.node').style("stroke", "black")
    	.style("fill", function(d) {  //fill tree-distinct nodes with texture

	    var line_direction = "";
	    var distinct = false;

	    if (t2_only_mutations.some(mut => d.data.id.split("_").includes(mut))) {
		line_direction = "6/8";
		distinct = true;
	    }
      
	    if (distinct) {

	const texture = textures
	      .lines()
	      .size(6)
	      .strokeWidth(1.5)
	      .orientation(line_direction)
	      .background("lightgray");   

	 //for initializing texture for highlighting
	 svg1.call(texture);
	 svg2.call(texture);	    
	 return texture.url();
      }
	    else {
		return "lightgray";
	    }})


  d3_links.selectAll('line.link.tree-2-link')
	    .style("stroke", function(d) {

		
        if (d.target.data.contribution == 0) {
          return "lightgray";
        }
        else {
          return scale(d.target.data.contribution);
        }
      })
	.style("stroke-width", function(d) {
	    if (d.target.data.contribution == 0) {
		return 2;
        }
        else {
          return edge_width_scale(d.target.data.contribution);
        }

	})
	    .style("transform", "translate(5, 20), scale(0.5)")


	d3_links.selectAll('line.link.tree-1-link')
	    .style("stroke", "lightgray")
	    .style("stroke-width", 2)
	    .style("transform", "translate(5, 20), scale(0.5)")

    }

    
    else {


    let edge_width_scale = d3.scaleLinear().domain([t_min, t_max]).range([5, 10]);

    d3_nodes.selectAll('circle.node').style("stroke", "black")
    	.style("fill", function(d) {  //fill tree-distinct nodes with texture

	   
	    var line_direction = "";
	    var distinct = false;

	    if (t1_only_mutations.some(mut => d.data.id.split("_").includes(mut))) {
		line_direction = "2/8";
		distinct = true;
	    }
      
	    if (distinct) {

	const texture = textures
	      .lines()
	      .size(6)
	      .strokeWidth(1.5)
	      .orientation(line_direction)
	      .background("lightgray");   

	 //for initializing texture for highlighting
	 svg1.call(texture);
	 svg2.call(texture);	    
	 return texture.url();
      }
	    else {
		return "lightgray";
	    }})



  d3_links.selectAll('line.link.tree-1-link')
      .style("stroke", function(d) {
        if (d.target.data.contribution == 0) {
          return "lightgray";
        }
        else {
          return scale(d.target.data.contribution);
        }
      })
	.style("stroke-width", function(d) {
	    if (d.target.data.contribution == 0) {
		return 2;
        }
        else {
          return edge_width_scale(d.target.data.contribution);
        }

	})
	    .style("transform", "translate(5, 20), scale(0.5)")
    

    d3_links.selectAll('line.link.tree-2-link')
	    .style("stroke", "lightgray")
	    .style("stroke-width", 2)
	    .style("transform", "translate(5, 20), scale(0.5)")
    }
}



// Coloring scheme for ancestor descendant with ground truth
function edge_colored_tree_ad_gt(d3_nodes, d3_links, t_max, t_min, scale, t1_only_mutations, t2_only_mutations, svg1, svg2, t1_edges_dict, t2_edges_dict, svg_id, gt_option) {

    

    let edge_width_scale = d3.scaleLinear().domain([t_min, t_max]).range([5, 10]);

    let edges_dict = t1_edges_dict;
    if (svg_id == 1) {
	edges_dict = t2_edges_dict;
    }

    if (gt_option == "t1") {
    
 
    d3_nodes.selectAll('circle.node').style("stroke", "black")
    	.style("fill", function(d) {  //fill tree-distinct nodes with texture

	    var line_direction = "";
	    var distinct = false;

	    if (t2_only_mutations.some(mut => d.data.id.split("_").includes(mut))) {
		line_direction = "6/8";
		distinct = true;
	    }
      
	    if (distinct) {

	const texture = textures
	      .lines()
	      .size(6)
	      .strokeWidth(1.5)
	      .orientation(line_direction)
	      .background("lightgray");   

	 //for initializing texture for highlighting
	 svg1.call(texture);
	 svg2.call(texture);	    
	 return texture.url();
      }
	    else {
		return "lightgray";
	    }})
    

  d3_links.selectAll('line.link.tree-2-link')
	.style("stroke", function(d) {

	    var key = d.source.data.id + d.target.data.id;


	    if (key in edges_dict) {
		return scale(edges_dict[key]);
	    }
	    else {
		return "lightgray";
	    }
      })
	.style("stroke-width", function(d) {


	    var key = d.source.data.id + d.target.data.id;

	    if (key in edges_dict) {
	
		return edge_width_scale(edges_dict[key]);
	    }
	    else {
		return 2;
	    }

	})
	    .style("transform", "translate(5, 20), scale(0.5)")


	 d3_links.selectAll('line.link.tree-1-link')
	    .style("stroke", "lightgray")
	    .style("stroke-width", 2)
	    .style("transform", "translate(5, 20), scale(0.5)")
    
    }
    else {
	
	 d3_nodes.selectAll('circle.node').style("stroke", "black")
    	.style("fill", function(d) {  //fill tree-distinct nodes with texture

	    var line_direction = "";
	    var distinct = false;

	    if (t1_only_mutations.some(mut => d.data.id.split("_").includes(mut))) {
		line_direction = "2/8";
		distinct = true;
	    }
      
	    if (distinct) {

	const texture = textures
	      .lines()
	      .size(6)
	      .strokeWidth(1.5)
	      .orientation(line_direction)
	      .background("lightgray");   

	 //for initializing texture for highlighting
	 svg1.call(texture);
	 svg2.call(texture);	    
	 return texture.url();
      }
	    else {
		return "lightgray";
	    }})


  d3_links.selectAll('line.link.tree-1-link')
	.style("stroke", function(d) {

	    var key = d.source.data.id + d.target.data.id;

	 

	    if (key in edges_dict) {
		return scale(edges_dict[key]);
	    }
	    else {
		return "lightgray";
	    }
        
      })
	.style("stroke-width", function(d) {


	    var key = d.source.data.id + d.target.data.id;

	    if (key in edges_dict) {

		return edge_width_scale(edges_dict[key]);
	    }
	    else {
		return 2;
	    }

	})
	    .style("transform", "translate(5, 20), scale(0.5)")

	 d3_links.selectAll('line.link.tree-2-link')
	    .style("stroke", "lightgray")
	    .style("stroke-width", 2)
	    .style("transform", "translate(5, 20), scale(0.5)")

    }
}


// Coloring scheme for parent child -> edge based
function edge_colored_tree(d3_nodes, d3_links, t_max, t_min, scale, t1_only_mutations, t2_only_mutations, svg1, svg2) {
    
    
    let edge_width_scale = d3.scaleLinear().domain([t_min, t_max]).range([5, 10]);


    d3_nodes.selectAll('circle.node').style("stroke", "black")
    	.style("fill", function(d) {  //fill tree-distinct nodes with texture

	    var line_direction = "";
	    var distinct = false;

	    if (t1_only_mutations.some(mut => d.data.id.split("_").includes(mut))) {
		line_direction = "2/8";
		distinct = true;
	    }
	    if (t2_only_mutations.some(mut => d.data.id.split("_").includes(mut))) {
		line_direction = "6/8";
		distinct = true;
	    }
      
	    if (distinct) {

	const texture = textures
	      .lines()
	      .size(6)
	      .strokeWidth(1.5)
	      .orientation(line_direction)
	      .background("lightgray");   

	 //for initializing texture for highlighting
	 svg1.call(texture);
	 svg2.call(texture);	    
	 return texture.url();
      }
	    else {
		return "lightgray";
	    }})



  d3_links.selectAll('line.link')
      .style("stroke", function(d) {
        if (d.target.data.contribution == 0) {
          return "lightgray";
        }
        else {
          return scale(d.target.data.contribution);
        }
      })
	.style("stroke-width", function(d) {
	    if (d.target.data.contribution == 0) {
		return 2;
        }
        else {
          return edge_width_scale(d.target.data.contribution);
        }

	})
      .style("transform", "translate(5, 20), scale(0.5)")
}


// Coloring scheme for ancestor descendant -> edge based
function edge_colored_tree_ad(d3_nodes, d3_links, t_max, t_min, scale, t1_only_mutations, t2_only_mutations, svg1, svg2, t1_edges_dict, t2_edges_dict, svg_id) {

    let edge_width_scale = d3.scaleLinear().domain([t_min, t_max]).range([5, 10]);

    let edges_dict = t1_edges_dict;
    if (svg_id == 1) {
	edges_dict = t2_edges_dict;
    }

 
    d3_nodes.selectAll('circle.node').style("stroke", "black")
    	.style("fill", function(d) {  //fill tree-distinct nodes with texture

	    var line_direction = "";
	    var distinct = false;

	    if (t1_only_mutations.some(mut => d.data.id.split("_").includes(mut))) {
		line_direction = "2/8";
		distinct = true;
	    }
	    if (t2_only_mutations.some(mut => d.data.id.split("_").includes(mut))) {
		line_direction = "6/8";
		distinct = true;
	    }
      
	    if (distinct) {

	const texture = textures
	      .lines()
	      .size(6)
	      .strokeWidth(1.5)
	      .orientation(line_direction)
	      .background("lightgray");   

	 //for initializing texture for highlighting
	 svg1.call(texture);
	 svg2.call(texture);	    
	 return texture.url();
      }
	    else {
		return "lightgray";
	    }})


  d3_links.selectAll('line.link')
	.style("stroke", function(d) {

	    var key = d.source.data.id + d.target.data.id;

	    if (key in edges_dict) {
		return scale(edges_dict[key]);
	    }
	    else {
		return "lightgray";
	    }
      })
	.style("stroke-width", function(d) {


	    var key = d.source.data.id + d.target.data.id;

	    if (key in edges_dict) {
		return edge_width_scale(edges_dict[key]);
	    }
	    else {
		return 2;
	    }

	})
      .style("transform", "translate(5, 20), scale(0.5)")
}

function setNoContributionLegend() {
  var div = document.getElementById("no-contribution-shape")
  if (distanceMetric.value === "parent_child_distance") {
    div.style.width = "100%";
    div.style.height = "2px";
    div.style.borderRadius = "none";
    div.style.border = "none";
  }
    if (distanceMetric.value === "ancestor_descendant_distance") {
    div.style.width = "100%";
    div.style.height = "2px";
    div.style.borderRadius = "none";
    div.style.border = "none";
    }
    if (distanceMetric.value === "incomparable_pair_recall") {
    div.style.width = "100%";
    div.style.height = "2px";
    div.style.borderRadius = "none";
    div.style.border = "none";
  }
  else {
    div.style.width = "20px";
    div.style.height = "20px";
    div.style.borderRadius = "50%";
    div.style.border = "1px solid gray";
  }
  console.log("borderRadius", div.style.borderRadius);
}

function submit_tree() {
  closeManualEditModal();
  setNoContributionLegend();
  /*
    Send trees to api in order to get
    data for input into d3 visualizations
  */
  var tree1Input = tree1TextArea.value;
  var tree2Input = tree2TextArea.value;
  var tree1Type = "newick"//inputTypeTree1.value;
    var tree2Type = "newick"//inputTypeTree2.value;

    //only submit trees if we have both
    if ((tree1Input == "") || (tree2Input == "")) {
	alert("Please submit two trees.")
    }
    else {

  var baseURL = get_API_base_URL();
  var url = baseURL + distanceMetric.value + "?";
  var url_components = [url, "tree1=", tree1Input, "&tree2=", tree2Input, "&treeType1=", tree1Type, "&treeType2=", tree2Type]
    url = url_components.join("");

  fetch(url)
  .then(response => response.json())
  .then(json_data => {
     if (json_data.Error) {
       alert(json_data.Error)
       return;
     }
     console.log("distance measure", distanceMetric.value);
     visualize("single", null, null, json_data, distanceMetric.value, null);
     //console.log("Here!");
     var t1_muts = json_data.t1_mutations;
     var t2_muts = json_data.t2_mutations;
     var t1_tripartite_edges = json_data.t1_tripartite_edges;
      var t2_tripartite_edges = json_data.t2_tripartite_edges;
      var t1_edges_dict = json_data.t1_edges_dict;
      var t2_edges_dict = json_data.t2_edges_dict;

      var up_relationships = json_data.up_relationships;
      var down_relationships = json_data.down_relationships;

      var gt_option = gtOption.value;

      
      createTripartite(distanceMetric.value, t1_muts, t2_muts, t1_tripartite_edges, t2_tripartite_edges, up_relationships, down_relationships, gt_option)
      createHeatmap(distanceMetric.value, t1_muts, t2_muts, t1_tripartite_edges, t2_tripartite_edges, gt_option);
     document.getElementById("intersection").onchange = () => {
	 createTripartite(distanceMetric.value, t1_muts, t2_muts, t1_tripartite_edges, t2_tripartite_edges,
			  up_relationships, down_relationships, gt_option)
	 createHeatmap(distanceMetric.value, t1_muts, t2_muts, t1_tripartite_edges, t2_tripartite_edges, gt_option);
     }
     document.getElementById("union").onchange = () => {
	 createTripartite(distanceMetric.value, t1_muts, t2_muts, t1_tripartite_edges, t2_tripartite_edges,
			  up_relationships, down_relationships, gt_option);
	 createHeatmap(distanceMetric.value, t1_muts, t2_muts, t1_tripartite_edges, t2_tripartite_edges, gt_option);
     }
  });
    }
}


function getAllMutations(nodes) {
  var all_mutations = [];
  nodes.forEach(node => {
    var label = node.data.label;
    var mutations = label.split(",");
    mutations.forEach(mutation => {
      all_mutations.push(remove_quotation(mutation.trim()));
    });
  });  
  return all_mutations;
}

// switches the icon for the input window onclick
$('.collapse').on('click', function(e) {
  $(this).toggleClass('expanded');
  $(this).next().toggleClass('bottombox');
  const isExpanded = $(this).hasClass('expanded');
  $(this).text(isExpanded ? '+' : '-');
});


function visualize(viewtype, svg1, svg2, json_data, distance_measure, scale) {

  set_visualization_event_listeners(distance_measure);
  var tree1_data = json_data.node_contribution_dict_1;
  var tree2_data = json_data.node_contribution_dict_2;
  var data = [tree1_data, tree2_data]
  var distance = json_data.distance;
  distance = distance.toExponential();

    var t1_edges_dict = json_data.t1_edges_dict
    var t2_edges_dict = json_data.t2_edges_dict

  var t1_nodes = d3.hierarchy(tree1_data).descendants();
  var t1_mutations = getAllMutations(t1_nodes);
  var t1_label = document.getElementById("tree1-mutations");

  var t2_nodes = d3.hierarchy(tree2_data).descendants();
  var t2_mutations = getAllMutations(t2_nodes);
  var t2_label = document.getElementById("tree2-mutations");


  var t1_top5_label = document.getElementById("t1_top5_summary_element");
  var t1_top5 = get_top_n_mutations(json_data.mutation_contribution_dict_1, 5).split(" ").join("");
  var t2_top5_label = document.getElementById("t2_top5_summary_element");
  var t2_top5 = get_top_n_mutations(json_data.mutation_contribution_dict_2, 5).split(" ").join("");

  var shared_mutations = intersect(t1_mutations, t2_mutations);
  var t1_only_mutations = difference(t1_mutations, shared_mutations);
  var t2_only_mutations = difference(t2_mutations, shared_mutations);

  if (viewtype == "single") {
    t1_label.innerHTML='';
    t2_label.innerHTML='';
  }
  else {
    t1_label.innerHTML=t1_only_mutations;
    t2_label.innerHTML=t2_only_mutations;
  }

  var dom_data = {
    t1_nodes,
    t1_mutations,
    t1_label,
    
    t2_nodes,
    t2_mutations, 
    t2_label,

    t1_top5_label,
    t1_top5,
    t2_top5_label,
    t2_top5,
      

    //shared_label,
    shared_mutations,
    t1_only_mutations,
      t2_only_mutations,


      t1_edges_dict,
      t2_edges_dict
  }

    if (viewtype == "single") {
    visualize_singleview(json_data, distance_measure, dom_data);
  }
 
}

function singleView(dom_data) {

  multiview_elements = document.querySelectorAll(".multiview"); 
  multiview_elements.forEach(element => {
    element.style.display = "none";
  });

  dom_data.top_five.style.display = "";
  dom_data.div.style.display = "flex";
  dom_data.legend.style.display = "block";

  var dropdown_visible = (dom_data.distance_dropdown.style.display === "inline-block");
  dom_data.distance_dropdown.style.display = dropdown_visible? "none": "inline-block";
  dom_data.distance_btns.style.display = "none";
  dom_data.multiview_btn.style.background = "#2C7A7A";
  dom_data.multiview_btn.style.color = "#F5F5F5";
  dom_data.singleview_btn.style.background = dropdown_visible? 
                                               "#2C7A7A": 
                                               dom_data.singleview_btn.style.background;
  dom_data.singleview_btn.style.color = dropdown_visible? 
                                               "#F5F5F5": 
                                               dom_data.singleview_btn.style.color;
}

function displayInputOptions(viewtype){

  var distance_btns = document.getElementById("distance-buttons");
  var distance_dropdown = document.getElementById('distance-dropdown')
  var div = document.getElementById("anyviz");
  var legend = document.getElementById("anyscale");
  var singleview_btn = document.getElementById("single");
  var multiview_btn = document.getElementById("multiple");
  var top_five = document.getElementById("top_five");
  var top_five_label = document.getElementById("top_five_label");
  var top_five_tree_1 = document.getElementById("t1_top5_summary_element");
    var top_five_tree_2 = document.getElementById("t2_top5_summary_element");

    var gt_dropdown = document.getElementById('gt-dropdown');

  var dom_data = {
    distance_btns,
    distance_dropdown,
    div, 
    legend,
    singleview_btn,
    multiview_btn,
    top_five, top_five_label, 
    top_five_tree_1, top_five_tree_2
  }

  if (viewtype == "single") {
    singleView(dom_data);
  }
  else {
    multiView(dom_data);
  }
}


  

function calculateEdgeColorsTripartite(distanceMeasure, arr1, arr2) {
  let edges = [];
      edgesIndex = 0;

  for (let i=0; i<arr1.length; i++) {
    let shared = 0;
    for (let j=0; j<arr2.length; j++) {
      if (distanceMeasure === "parent_child_distance") {
        let sameParent = arr1[i].parent === arr2[j].parent;
        let sameChild = arr1[i].child == arr2[j].child;
        if (sameParent && sameChild) {
          shared = 1;
        }
      }
      else if (distanceMeasure === "ancestor_descendant_distance" || distanceMeasure === "incomparable_pair_recall") {
        let sameAncestor = arr1[i].ancestor === arr2[j].ancestor;
        let sameDescendant = arr1[i].descendant == arr2[j].descendant;
        if (sameAncestor && sameDescendant) {
          shared = 1;
        }
      }
    }
    if (!shared) {
      let color = "#d95f02",
          index = edgesIndex;
      if (distanceMeasure === "parent_child_distance") {
        let parent = arr1[i].parent,
            child = arr1[i].child;
        edges[edgesIndex] = { parent, child, color, index }
      }
      else if (distanceMeasure === "ancestor_descendant_distance" || distanceMeasure === "incomparable_pair_recall") {
        let ancestor = arr1[i].ancestor,
            descendant = arr1[i].descendant;
        edges[edgesIndex] = { ancestor, descendant, color, index }
      }
      edgesIndex++;
    }
  }

  // also check for edges in arr2 not in arr1
  for (let i=0; i<arr2.length; i++) {
    let shared = 0;
    for (let j=0; j<arr1.length; j++) {
      if (distanceMeasure === "parent_child_distance") {
        let sameParent = arr2[i].parent === arr1[j].parent;
        let sameChild = arr2[i].child === arr1[j].child;
        if (sameParent && sameChild) {
          shared = 1;
        }
      }
      else if (distanceMeasure === "ancestor_descendant_distance" || distanceMeasure === "incomparable_pair_recall") {
        let sameAncestor = arr2[i].ancestor === arr1[j].ancestor;
        let sameDescendant = arr2[i].descendant === arr1[j].descendant;
        if (sameAncestor  && sameDescendant) {
          shared = 1;
        }
      }
    }
    if (!shared) {
      let color = "#7570b3",
          index = edgesIndex;
      if (distanceMeasure === "parent_child_distance") {
        let parent = arr2[i].parent,
            child = arr2[i].child;
        edges[edgesIndex] = { parent, child, color, index }
      }
      else if (distanceMeasure === "ancestor_descendant_distance" || distanceMeasure === "incomparable_pair_recall") {
        let ancestor = arr2[i].ancestor,
            descendant = arr2[i].descendant;
        edges[edgesIndex] = { ancestor, descendant, color, index }
      }
      edgesIndex++;
    }
  }
  return edges;
}


function intersectOrdering(mutationsT1, mutationsT2, mutationObjectsT1, mutationObjectsT2) {
  var lst = []; //makes a copy of mutationsT1
  mutationObjectsT1.forEach(mutationObject => {
    if (mutationsT2.includes(mutationObject.mutation)) {
      lst.push({mutation: mutationObject.mutation});
    }
  })
  return lst;
  
}

function unionOrdering(mutationsT1, mutationsT2) {
  // makes a copy of t1 mutations
  var lst = [];
  mutationsT1.forEach(mutation => {
    lst.push({mutation});
  })
  mutationsT2.forEach(mutation => {
    if (!mutationsT1.includes(mutation)) {
      lst.push({mutation});
    }
  })
  return lst;
}

function calculateEdgeColorsHeatMap(edges1, edges2, mutations1, mutations2, total_mutations) {
    let edges = Array();
    var edges_index = 0;
  
    for (let i = 0; i < total_mutations.length; i++) {
      for (let j = 0; j < total_mutations.length; j++) {

        let in_tree1 = 0,
          in_tree2 = 0;

        //current edge is in tree 1
        if (lookUpIndexEdgesParentChild(edges1, {parent: total_mutations[i].mutation, child: total_mutations[j].mutation}) != -1) {
          in_tree1 = 1;
        }

        //check if current edge is in tree 2
        if (lookUpIndexEdgesParentChild(edges2, {parent: total_mutations[i].mutation, child: total_mutations[j].mutation}) != -1) {
          in_tree2 = 1;
        }

        //decide what color depending on if it's: both, just tree1, just tree2, or neither

        //default to neither (empty/white square)
        let square_color = "white";

        if (in_tree1) { //only in tree 1
          square_color = "#d95f02";
        }
        if (in_tree2) { //only in tree 2
          square_color = "#7570b3";
        }
         if (in_tree1 && in_tree2) { //in both trees
          square_color = "lightgrey";
        }

        edges[edges_index] = {"parent": {"mutation": total_mutations[i].mutation}, "child": {"mutation": total_mutations[j].mutation}, "color": square_color, "index": edges_index};
        edges_index++;
        
      }
    }

  

    return edges;

  
}

function lookUpIndexEdgesParentChild(arr, obj) {
  for (let i=0; i<arr.length; i++) {
    
    if ((JSON.stringify(arr[i].parent) === JSON.stringify(obj.parent)) && (JSON.stringify(arr[i].child) === JSON.stringify(obj.child))) {
      return i;
    }
  }
  return -1;
}

function createLinkedHighlighting(clickedElement, mutation){    
    
    let font_size = '0.90em',
        expanded = '1.2em';
    d3.select(clickedElement).style('cursor', 'pointer')

    let clicked_classes = clickedElement.getAttribute("class");

    //get all of the mutations from the clicked_classes
    let these_classes = clicked_classes.split(" ");
    let class_muts = these_classes.filter((d) => d.includes("-node"));
    let all_mutations = class_muts.map((d) => d.split("-")[0]);


    /* for non-node cases */
    if (all_mutations.length == 0) {
	all_mutations.push(mutation);
    }
    
    //special case of just highlighting labels on tree if hovering over a node
      if (clicked_classes.includes("node_span_MAYBE")) {

	var tree_items = d3.selectAll(".tree-node."+mutation+"-mutation-hover-label");
	    
	  tree_items.style("font-size", d => {
	return "0.8em"}
		    ).style("transition", "font-size 0.5s");
	  tree_items.attr("fill", d => highlight_color);
    }
    else {

	
    d3.selectAll('.left-to-middle-edges')
    .style('opacity', b => {
	if (all_mutations.includes(b.child) || all_mutations.includes(b.descendant)) {
        return 1;
      }
      return 0.1;
    });
    d3.selectAll('.middle-to-right-edges')
    .style('opacity', b => {
	if (all_mutations.includes(b.parent) || all_mutations.includes(b.ancestor)) {
        return 1;
      }
      return 0.1;
    });
    d3.selectAll('.middle-circles')
    .attr('fill', b => {
      if (b.mutation === mutation) {
        return 'lightgray';
      }
      return 'white';
    })
    .attr('r', b => { 
      if (b.mutation === mutation) {
        return 12;
      }
      return 8;
    })
    .style('z-index', b => { 
      if (b.mutation === mutation) {
        return 1;
      }
      return 0;
    })
	//}


    var tripartite_labels_left = d3.selectAll(".left-of-"+mutation);
    tripartite_labels_left.style("fill", b=> {

	    return highlight_color;

    });

     var tripartite_labels_right = d3.selectAll(".right-of-"+mutation);
    tripartite_labels_right.style("fill", b=> {

	    return highlight_color;

    });
    

	
	var items = d3.selectAll("." + mutation + "-mutation-hover-label");
	
    items.style("color",highlight_color);
    items.style("fill", highlight_color);
    items.style("transition", "color 0.5s");
    items.style("cursor", "pointer");


    let mutation_class = '.'+mutation+'-mutation-hover-label';

    let highlight_row = '.'+mutation+'-highlight-row',
	highlight_column = '.'+mutation+'-highlight-column';

     d3.selectAll('.heatmap-links'+highlight_row)
    .attr("stroke-width", 2)

    d3.selectAll('.heatmap-links'+highlight_column)
    .attr("stroke-width", 2)

    d3.selectAll('.rowLabel'+mutation_class)
    .attr('fill', 'red')

    d3.selectAll('.columnLabel'+mutation_class)
    .attr('fill', 'red')




    }
}

function removeLinkedHighlighting(clickedElement, mutation) {
    let font_size = '0.90em',
        expanded = '1.2em';

    d3.selectAll('.left-to-middle-edges').style('opacity', 0.2);
    d3.selectAll('.middle-to-right-edges').style('opacity', 0.2);
    d3.selectAll('.middle-circles').attr('fill', 'white');
    d3.selectAll('.left-labels').attr('fill', 'black');
    d3.selectAll('.left-labels').style('font-weight', 'normal');
    d3.selectAll('.left-labels').style('font-size', '13px');

    d3.selectAll('.labels-left').style("fill", "white");
    d3.selectAll('.labels-right').style("fill", "white");

    d3.selectAll('.heatmap-rowLabel').style('font-size', '13px').attr('fill', 'black');
   

    tripartite_middle_circles = d3.selectAll('.middle-circles')
    tripartite_middle_circles.attr('fill', 'white').attr('r', 8)
    var items = d3.selectAll("." + mutation + "-mutation-hover-label");
    items.style("transition", "color 0.5s");
    items.style("color", mutation_table_color);
   
  
    items.style("fill", (d, index, items) => {
      if (items[index].localName == "span") {
        return mutation_table_color;
      }
      else {
        return no_contribution_color;
        var tree = items[index].ownerSVGElement.id;
        var contribution = items[index].parentNode.__data__.data["contribution"];
        if (tree == 'svg1') {
          var mutation = items[index].__data__[0];
          var contribution = d[3][mutation]["contribution"];
          if (contribution > 0) {
            return contribution_color;
          }
          else {
            return no_contribution_color;
          }
        }
        else {
          var mutation = items[index].__data__[0];
          var contribution = d[4][mutation]["contribution"];
          if (contribution > 0) {
            return contribution_color;
          }
          else {
            return no_contribution_color;
          }
        }
      }
    });

    
    var tree_items = d3.selectAll(".tree-node."+mutation+"-mutation-hover-label");
    tree_items.style("font-size", d => {
	return "0.7em"}
	       ).style("transition", "font-size 0.5s");

    let mutation_class = '.'+mutation+'-mutation-hover-label';

        let highlight_row = '.'+mutation+'-highlight-row',
      highlight_column = '.'+mutation+'-highlight-column';

    d3.selectAll('.heatmap-links'+highlight_row)
    .attr("stroke-width", .25)

    d3.selectAll('.heatmap-links'+highlight_column)
    .attr("stroke-width", .25)

    d3.selectAll('.rowLabel'+mutation_class)
    .attr('fill', 'black')
    .style("font-size", heatmapFontSize)

    d3.selectAll('.columnLabel'+mutation_class)
    .attr('fill', "black")
    .style("font-size", heatmapFontSize);
}


// D3 implementation of the tripartite graph
function createTripartite(distanceMeasure, t1_muts, t2_muts, t1_tripartite_edges, t2_tripartite_edges, up_relationships, down_relationships, gt_option) {

  // some default values for styling  
  var defaultOpacity = 0.2
  var defaultStroke = "black";

  var div = document.querySelector(".tripartite-component"); // div element that contains tripartite 
  var height = div.offsetHeight;
  var width = div.offsetWidth;

  var total_mutations = [];
  var mutation_objects = [];
  var t1_mutation_objects = []; 
  var t2_mutation_objects = []; 

  t1_muts.forEach(mut => {
    mutation_objects.push({"mutation": mut})
    t1_mutation_objects.push({"mutation": mut})
    //total_mutations.push(mut)
  })
  t2_muts.forEach(mut => {
    mutation_objects.push({"mutation": mut})
    t2_mutation_objects.push({"mutation": mut})
    //total_mutations.push(mut)
  })
  var mutation_ordering = document.getElementById("intersection");
  if (mutation_ordering.checked) {
    if (distanceMeasure === "parent_child_distance") {
 
      total_mutations = d3.map(intersectOrdering(t1_muts, t2_muts, t1_mutation_objects, t2_mutation_objects), d => d.mutation); 
      var t1_tripartite_edges = d3.filter(t1_tripartite_edges, d => {
        return total_mutations.includes(d.parent) && total_mutations.includes(d.child);
      })
      var t2_tripartite_edges = d3.filter(t2_tripartite_edges, d => {
        return total_mutations.includes(d.parent) && total_mutations.includes(d.child);
      })
    }
    else if (distanceMeasure === "ancestor_descendant_distance" || distanceMeasure === "incomparable_pair_recall"){
      total_mutations = d3.map(intersectOrdering(t1_muts, t2_muts, t1_mutation_objects, t2_mutation_objects), d => d.mutation); 
      
      var t1_tripartite_edges = d3.filter(t1_tripartite_edges, d => {
        return total_mutations.includes(d.ancestor) && total_mutations.includes(d.descendant);
      })
      var t2_tripartite_edges = d3.filter(t2_tripartite_edges, d => {
        return total_mutations.includes(d.ancestor) && total_mutations.includes(d.descendant);
      })
    }
  }
  else {
    if (distanceMeasure === "parent_child_distance") {
      total_mutations = d3.map(unionOrdering(t1_muts, t2_muts, t1_mutation_objects, t2_mutation_objects), d => d.mutation); 
      var t1_tripartite_edges = d3.filter(t1_tripartite_edges, d => {
        return total_mutations.includes(d.parent) && total_mutations.includes(d.child);
      })
      var t2_tripartite_edges = d3.filter(t2_tripartite_edges, d => {
        return total_mutations.includes(d.parent) && total_mutations.includes(d.child);
      })
    }
    else if (distanceMeasure === "ancestor_descendant_distance" || distanceMeasure === "incomparable_pair_recall") {
      total_mutations = d3.map(unionOrdering(t1_muts, t2_muts, t1_mutation_objects, t2_mutation_objects), d => d.mutation); 
      var t1_tripartite_edges = d3.filter(t1_tripartite_edges, d => {
        return total_mutations.includes(d.ancestor) && total_mutations.includes(d.descendant);
      })
      var t2_tripartite_edges = d3.filter(t2_tripartite_edges, d => {
        return total_mutations.includes(d.ancestor) && total_mutations.includes(d.descendant);
      })
    }
  }
  total_mutations = Array.from(new Set(total_mutations)) // removes duplicate mutations
  t1_mutation_objects = d3.filter(t1_mutation_objects, d => {
    return total_mutations.includes(d.mutation)
  })
  t2_mutation_objects = d3.filter(t2_mutation_objects, d => {
    return total_mutations.includes(d.mutation)
  })
  mutation_objects = d3.filter(mutation_objects, d => {
    return total_mutations.includes(d.mutation)
  })
 

  var svg = d3.create('svg')
              .style('width', width)
              .style('height', '99%')
              .style('background-color', 'white');
  var margin = { top: 50, left: 100, right: 50 }

  var mutList = total_mutations 
  var colored_edges = '' // deciding orange or purple edge
  colored_edges = calculateEdgeColorsTripartite(distanceMeasure, t1_tripartite_edges, t2_tripartite_edges)

  // defines x and y axis of tripartite graph
  var mutationScale = d3.scalePoint().domain(mutList).range([margin.top, height - margin.top])
  var yAxis = d3.axisLeft(mutationScale)


    //need a better fix than hardcoding
  var xScale = d3.scalePoint().domain([0, 1, 2]).range([0 + margin.left - 40, width - margin.right - 40])
  var xAxis = d3.axisBottom(xScale)

  // positioning the axes
  svg.append('g')
  .attr('transform', `translate(${margin.left}, 0)`)
  .call(yAxis)
  .style('display', 'none')

  svg.append('g')
  .attr('transform', `translate(20, ${height - margin.top})`)
  .call(xAxis)
	.style('display', 'none')


    let t1_mut_max = "";
    let t2_mut_max = "";
    for (let i=0; i<t1_muts.length; i++) {
	if (t1_muts[i].length > t1_mut_max.length) {
	    t1_mut_max = t1_muts[i];
	}
    }
    for (let i=0; i<t2_muts.length; i++) {
	if (t2_muts[i].length > t2_mut_max.length) {
	    t2_mut_max = t2_muts[i];
	}
    }

    mutation_max = Math.max(t1_mut_max.length, t2_mut_max.length);
    

  // creating tripartite graph

  svg.selectAll('.left-circles')
  .data(mutation_objects)
  .join('circle')
  .classed('left-circles', true)
  .attr('r', 5)
  .attr('cx', xScale(0) + 20)
  .attr('cy', d => mutationScale(d.mutation))
  .attr('stroke', defaultStroke)
  .attr('fill', 'white')
  .style('opacity', defaultOpacity);


    
  svg.selectAll('.middle-circles')
  .data(mutation_objects)
  .join('rect')
    .classed('middle-circles', true)
	.attr("width", mutation_max * 10)
	.attr("height", 12)
	.attr('x', xScale(1) - (mutation_max*10*.5) + 20)
  .attr('y', d => mutationScale(d.mutation) - 6)
	.attr('stroke', "lightgray") 
	.attr('stroke-width', '1px')
  .attr('fill-opacity', 0)

  svg.selectAll('.right-circles')
  .data(mutation_objects)
  .join('circle')
  .classed('right-circles', true)
  .attr('r', 5)
  .attr('cx', xScale(2) + 20)
  .attr('cy', d => mutationScale(d.mutation))
  .attr('stroke', defaultStroke)
  .attr('fill', 'white')
	.attr('opacity', defaultOpacity)


    /* actually technically middle labels now...should fix naming conventions */

   svg.selectAll('.left-labels')
  .data(mutation_objects)
  .join('text')
	.attr("class", d => {

	    let class_list = "left-labels "+d.mutation+"-mutation-hover-label";

	    return class_list;
	})
	.attr('x', xScale(1) + 20)
  .attr('y', d => mutationScale(d.mutation) + 5)
	.attr('text-anchor', 'middle')
  .text(d => d.mutation)
  .style('font-size', '13px')
  .style('font-family', 'Roboto Mono')
  .style('transition', 'font-size 0.5s')
  .on('mouseover', function(event, data) {
    createLinkedHighlighting(this, data.mutation);
  })
  .on('mouseout', function(event, data) {
    removeLinkedHighlighting(this, data.mutation);
  });

     svg.selectAll('.labels-left')
  .data(mutation_objects)
  .join('text')
	.attr("class", d => {

	    let class_list =  "labels-left ";

	    if (down_relationships[d.mutation] != undefined) {

	    for (let i=0; i<down_relationships[d.mutation].length; i++) {
		class_list += "left-of-" + down_relationships[d.mutation][i] + " ";
	    }
	    }

	    return class_list;

	})

	.attr('x', xScale(0))
  .attr('y', d => mutationScale(d.mutation) + 5)
  
	.attr('text-anchor', 'end')
  .text(d => d.mutation)
	.style('font-size', '13px')
	.style("fill", "white")
  .style('font-family', 'Roboto Mono')
  .style('transition', 'font-size 0.5s');

     svg.selectAll('.labels-right')
  .data(mutation_objects)
  .join('text')
	.attr("class", d => {

	    let class_list = "labels-right ";

	    if (up_relationships[d.mutation] != undefined) {

	    for (let i=0; i<up_relationships[d.mutation].length; i++) {
		class_list += "right-of-" + up_relationships[d.mutation][i] + " ";
	    }
	    }

	    return class_list;

	    
	})
	.attr('x', xScale(2) + 40)
  .attr('y', d => mutationScale(d.mutation) + 5)
	.attr('text-anchor', 'start')
	.text(d => d.mutation)
	.style("fill", "white")
  .style('font-size', '13px')
  .style('font-family', 'Roboto Mono')
  .style('transition', 'font-size 0.5s');
    

    /* end of more labels section */


    if (gt_option == "no") {

  svg.selectAll('.left-to-middle-edges')
  .data(colored_edges)
  .join('line')
  .classed('left-to-middle-edges', true)
  .attr('x1', xScale(0) + 20)
	.attr('x2', xScale(1) + 20 - (.5*10*mutation_max))
  .attr('y1', d => {
    if (distanceMeasure === "parent_child_distance") {
      return mutationScale(d.parent)
    }
    else if (distanceMeasure === "ancestor_descendant_distance" || distanceMeasure === "incomparable_pair_recall"){
      return mutationScale(d.ancestor)
    }
  })
  .attr('y2', d => {
    if (distanceMeasure === "parent_child_distance") {
      return mutationScale(d.child)
    }
    else if (distanceMeasure === "ancestor_descendant_distance" || distanceMeasure === "incomparable_pair_recall"){
      return mutationScale(d.descendant)
    }
  })
  .attr('stroke', d => d.color)

  svg.selectAll('middle-to-right-edges')
  .data(colored_edges)
  .join('line')
  .classed('middle-to-right-edges', true)
	.attr('x1', xScale(1) + 20 + (.5*10*mutation_max))
  .attr('x2', xScale(2) + 20)
  .attr('y1', d => {
    if (distanceMeasure === "parent_child_distance") {
      return mutationScale(d.parent)
    }
    else if (distanceMeasure === "ancestor_descendant_distance" || distanceMeasure === "incomparable_pair_recall"){
      return mutationScale(d.ancestor)
    }
  })
  .attr('y2', d => {
    if (distanceMeasure === "parent_child_distance") {
      return mutationScale(d.child)
    }
    else if (distanceMeasure === "ancestor_descendant_distance" || distanceMeasure === "incomparable_pair_recall"){
      return mutationScale(d.descendant)
    }
  })
  .attr('stroke', d => d.color) 

  // adding the tripartite to the DOM
  if (div.lastElementChild) {
    div.removeChild(div.lastElementChild);
  }
  div.append(svg.node())
    }


    
    else if (gt_option == "t1") {

  svg.selectAll('.left-to-middle-edges')
  .data(colored_edges)
  .join('line')
  .classed('left-to-middle-edges', true)
  .attr('x1', xScale(0) + 20)
	.attr('x2', xScale(1) + 20 - (.5*10*mutation_max))
  .attr('y1', d => {
    if (distanceMeasure === "parent_child_distance") {
      return mutationScale(d.parent)
    }
    else if (distanceMeasure === "ancestor_descendant_distance" || distanceMeasure === "incomparable_pair_recall"){
      return mutationScale(d.ancestor)
    }
  })
  .attr('y2', d => {
    if (distanceMeasure === "parent_child_distance") {
      return mutationScale(d.child)
    }
    else if (distanceMeasure === "ancestor_descendant_distance" || distanceMeasure === "incomparable_pair_recall"){
      return mutationScale(d.descendant)
    }
  })
	    .attr('stroke', function(d) {
		if (d.color == "#7570b3") {
		    return "#cb181d";
		}
	    })

  svg.selectAll('middle-to-right-edges')
  .data(colored_edges)
  .join('line')
  .classed('middle-to-right-edges', true)
	.attr('x1', xScale(1) + 20 + (.5*10*mutation_max))
  .attr('x2', xScale(2) + 20)
  .attr('y1', d => {
    if (distanceMeasure === "parent_child_distance") {
      return mutationScale(d.parent)
    }
    else if (distanceMeasure === "ancestor_descendant_distance" || distanceMeasure === "incomparable_pair_recall"){
      return mutationScale(d.ancestor)
    }
  })
  .attr('y2', d => {
    if (distanceMeasure === "parent_child_distance") {
      return mutationScale(d.child)
    }
    else if (distanceMeasure === "ancestor_descendant_distance" || distanceMeasure === "incomparable_pair_recall"){
      return mutationScale(d.descendant)
    }
  })
	    .attr('stroke', function(d) {
		if (d.color == "#7570b3") {
		    return "#cb181d";
		}
	    }) 

  // adding the tripartite to the DOM
  if (div.lastElementChild) {
    div.removeChild(div.lastElementChild);
  }
  div.append(svg.node())
    }
    else {

  svg.selectAll('.left-to-middle-edges')
  .data(colored_edges)
  .join('line')
  .classed('left-to-middle-edges', true)
  .attr('x1', xScale(0) + 20)
	.attr('x2', xScale(1) + 20 - (.5*10*mutation_max))
  .attr('y1', d => {
    if (distanceMeasure === "parent_child_distance") {
      return mutationScale(d.parent)
    }
    else if (distanceMeasure === "ancestor_descendant_distance" || distanceMeasure === "incomparable_pair_recall"){
      return mutationScale(d.ancestor)
    }
  })
  .attr('y2', d => {
    if (distanceMeasure === "parent_child_distance") {
      return mutationScale(d.child)
    }
    else if (distanceMeasure === "ancestor_descendant_distance" || distanceMeasure === "incomparable_pair_recall"){
      return mutationScale(d.descendant)
    }
  })
	    .attr('stroke', function(d) {if (d.color == "#d95f02") {
		    return "#cb181d";
		}})

  svg.selectAll('middle-to-right-edges')
  .data(colored_edges)
  .join('line')
  .classed('middle-to-right-edges', true)
	.attr('x1', xScale(1) + 20 + (.5*10*mutation_max))
  .attr('x2', xScale(2) + 20)
  .attr('y1', d => {
    if (distanceMeasure === "parent_child_distance") {
      return mutationScale(d.parent)
    }
    else if (distanceMeasure === "ancestor_descendant_distance" || distanceMeasure === "incomparable_pair_recall"){
      return mutationScale(d.ancestor)
    }
  })
  .attr('y2', d => {
    if (distanceMeasure === "parent_child_distance") {
      return mutationScale(d.child)
    }
    else if (distanceMeasure === "ancestor_descendant_distance" || distanceMeasure === "incomparable_pair_recall"){
      return mutationScale(d.descendant)
    }
  })
	    .attr('stroke', function(d) {
	    if (d.color == "#d95f02") {
		    return "#cb181d";
	    }
	    }) 

  // adding the tripartite to the DOM
  if (div.lastElementChild) {
    div.removeChild(div.lastElementChild);
  }
  div.append(svg.node())
    }
}

function calculateEdgeColorsHeatMap(edges1, edges2, mutations1, mutations2, total_mutations) {
    let edges = Array();
    var edges_index = 0;
  
    for (let i = 0; i < total_mutations.length; i++) {
      for (let j = 0; j < total_mutations.length; j++) {
        let in_tree1 = 0,
          in_tree2 = 0;
        //current edge is in tree 1
        if (lookUpIndexEdgesParentChild(edges1, {parent: total_mutations[i].mutation, child: total_mutations[j].mutation}) != -1) {
          in_tree1 = 1;
        }
        // check if current edge is in tree 2
        if (lookUpIndexEdgesParentChild(edges2, {parent: total_mutations[i].mutation, child: total_mutations[j].mutation}) != -1) {
          in_tree2 = 1;
        }
        // decide what color depending on if it's: both, just tree1, just tree2, or neither
        // default to neither (empty/white square)
        let square_color = "white";
        if (in_tree1) { //only in tree 1
          square_color = "#d95f02";
        }
        if (in_tree2) { //only in tree 2
          square_color = "#7570b3";
        }
         if (in_tree1 && in_tree2) { //in both trees
          square_color = "lightgrey";
        }
        edges[edges_index] = {"parent": {"mutation": total_mutations[i].mutation}, "child": {"mutation": total_mutations[j].mutation}, "color": square_color, "index": edges_index};
        edges_index++;
      }
    }
    return edges;
}

//ANCESTOR DESCENDANT TRIPARTITE
function calculateEdgeColorsAncestorDescendantTripartite(arr1, arr2) {
    let edges = Array();
    var edges_index = 0;
    for (let i = 0; i < arr1.length; i++) {
      let shared = 0;
      for (let j = 0; j < arr2.length; j++) {
          if ((arr1[i].ancestor == arr2[j].ancestor) && (arr1[i].descendant == arr2[j].descendant)) {
            shared = 1;
          }
      }
      if (!shared) {
        edges[edges_index] = {"ancestor": arr1[i]["ancestor"], "descendant": arr1[i]["descendant"], "color": "#d95f02", "index": edges_index};
        edges_index++;
      }
    }

    //also check if there are any edges in arr2 that are not in arr1
    for (let i = 0; i < arr2.length; i++) {
      let shared = 0;
      for (let j = 0; j < arr1.length; j++) {
          if ((arr2[i].ancestor == arr1[j].ancestor) && (arr2[i].descendant == arr1[j].descendant)) {
            //then the edge is shared
            shared = 1;
          }
      }
      if (!shared) {
        edges[edges_index] = {"ancestor": arr2[i]["ancestor"], "descendant": arr2[i]["descendant"], "color": "#7570b3", "index": edges_index};
        edges_index++;
      }
    }
    return edges;
}

function calculateEdgeColorsHeatMapAncestorDescendant(edges1, edges2, mutations1, mutations2, total_mutations) {
    let edges = [];
    var edges_index = 0;

    for (let i = 0; i < total_mutations.length; i++) {
      for (let j = 0; j < total_mutations.length; j++) {
        let in_tree1 = 0,
            in_tree2 = 0;
        // current edge is in tree 1
        if (lookUpIndexEdgesAncestorDescendant(edges1, {ancestor: total_mutations[i].mutation, descendant: total_mutations[j].mutation}) != -1) {
          in_tree1 = 1;
        }
        // check if current edge is in tree 2
        if (lookUpIndexEdgesAncestorDescendant(edges2, {ancestor: total_mutations[i].mutation, descendant: total_mutations[j].mutation}) != -1) {
          in_tree2 = 1;
        }

        //decide what color depending on if it's: both, just tree1, just tree2, or neither

        //default to neither (empty/white square)
        let square_color = "white";
        if (in_tree1) { //only in tree 1
          square_color = "#d95f02";
        }
        if (in_tree2) { //only in tree 2
          square_color = "#7570b3";
        }
         if (in_tree1 && in_tree2) { //in both trees
          square_color = "lightgrey";
        }
        edges[edges_index] = {"ancestor": {"mutation": total_mutations[i].mutation}, "descendant": {"mutation": total_mutations[j].mutation}, "color": square_color, "index": edges_index};
        edges_index++;
      }
    }
    return edges;
}

function lookUpIndexEdgesAncestorDescendant(arr, obj) {
  for (let i=0; i<arr.length; i++) {
    
    if ((JSON.stringify(arr[i].ancestor) === JSON.stringify(obj.ancestor)) && (JSON.stringify(arr[i].descendant) === JSON.stringify(obj.descendant))) {
      return i;
    }
  }
  return -1;
}

function takeToGeneCards(mutation) {
  var gene_url = "https://www.genecards.org/cgi-bin/carddisp.pl?gene=" + mutation;
  window.open(gene_url, "_blank"); 
}

function filterEdges(distanceMeasure, edges, mutations) {
  var filtered_edges = []
  if (distanceMeasure === "parent_child_distance") {
    filtered_edges = d3.filter(edges, edge => {
      return mutations.includes(edge.parent) && mutations.includes(edge.child)
    })
  }
  else if (distanceMeasure === "ancestor_descendant_distance") {
    filtered_edges = d3.filter(edges, edge => {
      return mutations.includes(edge.ancestor) && mutations.includes(edge.descendant)
    })
  }
  return filtered_edges;
}

function createHeatmap(distanceMeasure, t1_muts, t2_muts, t1_edges, t2_edges, gt_option) {
  var div = document.querySelector(".heatmap-component");
  var width = div.offsetWidth;
  var height = div.offsetHeight;
  var margin = {top: 15, left: 80, right: 30, bottom: 80};//{top: 50, left: 100, right: 50, bottom: 80};
  var padding = 10;

  // data that we'll feed into the visualization 
  var mutation_objects = [] 
  var t1_mutation_objects = [] 
  var t2_mutation_objects = [] 
  var total_mutations = [] 

  // initializing some dictionaries 
  t1_muts.forEach(mut => {
    mutation_objects.push({"mutation": mut})
    t1_mutation_objects.push({"mutation": mut})
  })
  t2_muts.forEach(mut => {
    mutation_objects.push({"mutation": mut})
    t2_mutation_objects.push({"mutation": mut})
  })


  // taking the union or the intersection of the mutation sets  

  var intersection_radio_btn = document.getElementById("intersection");
  if (intersection_radio_btn.checked) {
      total_mutations = d3.map(intersectOrdering(t1_muts, t2_muts, t1_mutation_objects, t2_mutation_objects), d => d.mutation); 
  }
  else {
      total_mutations = d3.map(unionOrdering(t1_muts, t2_muts, t1_mutation_objects, t2_mutation_objects), d => d.mutation); 
  }

  // filtering to match with the option of mutation intersect or union
  t1_tripartite_edges = filterEdges(distanceMeasure, t1_edges, total_mutations);
  t2_tripartite_edges = filterEdges(distanceMeasure, t2_edges, total_mutations);
  total_mutations = new Set(total_mutations);
  mutation_objects = d3.filter(mutation_objects, d => {
    return total_mutations.has(d.mutation) 
  })
  var mutation_objects_dups_removed = []
  mutation_objects.forEach(obj => {
    if (d3.filter(mutation_objects_dups_removed, d => d.mutation === obj.mutation).length === 0){
      mutation_objects_dups_removed.push(obj);
    }	
  })

  // some default values for styling
  let font_size = '0.90em',
      expanded = '1.2em';

  let row_title = "Parent",
      column_title = "Child"; 

  let mutations_list = mutation_objects_dups_removed,
      mutations_order = total_mutations,
      edges1 = t1_edges,
      edges2 = t2_edges,
      mutations1 = t1_muts,
      mutations2 = t2_muts;

    
    //account for the edge length of the squares when calculating the scales
    
    var width_adjustment =  (width - margin.left - margin.right) / mutations_list.length;
    var height_adjustment = (height - margin.bottom - margin.top) / mutations_list.length;

  // create scales to place the nodes and links
  let xScale = d3.scalePoint()
      .domain(mutations_order)
      .range([margin.left, width - margin.right - width_adjustment])
  
  let yScale = d3.scalePoint()
      .domain(mutations_order)
      .range([margin.bottom, height - margin.top - height_adjustment])

  //edge length for the squares
  var square_side = xScale(t1_muts[1]) - xScale(t1_muts[0]);

  let svg = d3.create('svg').attr('width', width).attr('height', '99%');

  var edgeColorsHeatMap = []
  if (distanceMeasure === "parent_child_distance") {
    edgeColorsHeatMap = calculateEdgeColorsHeatMap(edges1, edges2, mutations1, mutations2, mutations_list)
  }
  else if (distanceMeasure === "ancestor_descendant_distance" || distanceMeasure === "incomparable_pair_recall") {
    edgeColorsHeatMap = calculateEdgeColorsHeatMapAncestorDescendant(edges1, edges2, mutations1, mutations2, mutations_list)

    row_title = "Ancestor";
    column_title = "Descendant";
  }




    if (gt_option == "no") {

  svg.selectAll('.heatmap-links')
    .data(edgeColorsHeatMap)
    .join('rect')
    .attr('class', d => {
      if (distanceMeasure === "parent_child_distance") {
        return 'heatmap-links '+d.parent.mutation+'-highlight-row '+d.child.mutation+'-highlight-column'
      }
      else if (distanceMeasure === "ancestor_descendant_distance" || distanceMeasure === "incomparable_pair_recall") {
        return 'heatmap-links '+d.ancestor.mutation+'-highlight-row '+d.descendant.mutation+'-highlight-column'
      }
    })
    .attr('x' , d => {
	if (distanceMeasure === "parent_child_distance") {
         return xScale(d.parent.mutation);
      }
      else if (distanceMeasure === "ancestor_descendant_distance" || distanceMeasure === "incomparable_pair_recall") {
         return xScale(d.ancestor.mutation);
      }
    })
    .attr('y', d => {
      if (distanceMeasure === "parent_child_distance") {
        return yScale(d.child.mutation);
      }
      else if (distanceMeasure === "ancestor_descendant_distance" || distanceMeasure === "incomparable_pair_recall") {
        return yScale(d.descendant.mutation);
      }
    })
    .attr('stroke', "black")
    .attr("stroke-width", 0.25)
    .attr('width', (width - margin.left - margin.right) / mutations_order.size + 'px') 
    .attr('height', (height - margin.top - margin.bottom) / mutations_order.size + 'px')
    .attr('fill', d => d.color)
	    .style('opacity', 0.5);


    }

    else if (gt_option == "t1") {

  svg.selectAll('.heatmap-links')
    .data(edgeColorsHeatMap)
    .join('rect')
    .attr('class', d => {
      if (distanceMeasure === "parent_child_distance") {
        return 'heatmap-links '+d.parent.mutation+'-highlight-row '+d.child.mutation+'-highlight-column'
      }
      else if (distanceMeasure === "ancestor_descendant_distance" || distanceMeasure === "incomparable_pair_recall") {
        return 'heatmap-links '+d.ancestor.mutation+'-highlight-row '+d.descendant.mutation+'-highlight-column'
      }
    })
    .attr('x' , d => {
	if (distanceMeasure === "parent_child_distance") {
         return xScale(d.parent.mutation);
      }
      else if (distanceMeasure === "ancestor_descendant_distance" || distanceMeasure === "incomparable_pair_recall") {
         return xScale(d.ancestor.mutation);
      }
    })
    .attr('y', d => {
      if (distanceMeasure === "parent_child_distance") {
        return yScale(d.child.mutation);
      }
      else if (distanceMeasure === "ancestor_descendant_distance" || distanceMeasure === "incomparable_pair_recall") {
        return yScale(d.descendant.mutation);
      }
    })
    .attr('stroke', "black")
    .attr("stroke-width", 0.25)
    .attr('width', (width - margin.left - margin.right) / mutations_order.size + 'px') 
    .attr('height', (height - margin.top - margin.bottom) / mutations_order.size + 'px')
	    .attr('fill', function(d) {
	    	if (d.color == "#7570b3") {
		    return "#cb181d";
		}
		return "white";
	    })
	    .style('opacity', 0.5);
    }

    else {

  svg.selectAll('.heatmap-links')
    .data(edgeColorsHeatMap)
    .join('rect')
    .attr('class', d => {
      if (distanceMeasure === "parent_child_distance") {
        return 'heatmap-links '+d.parent.mutation+'-highlight-row '+d.child.mutation+'-highlight-column'
      }
      else if (distanceMeasure === "ancestor_descendant_distance" || distanceMeasure === "incomparable_pair_recall") {
        return 'heatmap-links '+d.ancestor.mutation+'-highlight-row '+d.descendant.mutation+'-highlight-column'
      }
    })
    .attr('x' , d => {
	if (distanceMeasure === "parent_child_distance") {
         return xScale(d.parent.mutation);
      }
      else if (distanceMeasure === "ancestor_descendant_distance" || distanceMeasure === "incomparable_pair_recall") {
         return xScale(d.ancestor.mutation);
      }
    })
    .attr('y', d => {
      if (distanceMeasure === "parent_child_distance") {
        return yScale(d.child.mutation);
      }
      else if (distanceMeasure === "ancestor_descendant_distance" || distanceMeasure === "incomparable_pair_recall") {
        return yScale(d.descendant.mutation);
      }
    })
    .attr('stroke', "black")
    .attr("stroke-width", 0.25)
    .attr('width', (width - margin.left - margin.right) / mutations_order.size + 'px') 
    .attr('height', (height - margin.top - margin.bottom) / mutations_order.size + 'px')
	    .attr('fill', function(d) {
		if (d.color == "#d95f02") {
		    return "#cb181d";
		}
	
		    return "white";

	    })
	    .style('opacity', 0.5);


    }


    heatmapFontSize = (width - margin.left - margin.right) / (mutations_order.size * 1.2);

    if (heatmapFontSize > 18) {
	heatmapFontSize = 18;
    }

  svg.selectAll('.rowLabel')
    .data(mutations_order)
    .join('text')
    .attr('class', d => 'rowLabel '+d+'-mutation-hover-label')
    .attr('fill', 'black')
    .attr("x", margin.left - padding)
    .attr("y", d => yScale(d) + (square_side/2))
    .text(d => d)
    .attr('text-anchor', 'end')
    .attr('alignment-baseline', 'middle')
    .style("font-family", "Roboto Mono")
	.style("font-size", heatmapFontSize + 'px') //font_size
	.on('mouseover', function(event, data) { createLinkedHighlighting(this, data)})
	.on('mouseout', function(event, data) { removeLinkedHighlighting(this, data)})

  svg.selectAll('.columnLabel')
   .data(mutations_order)
   .enter()
   .append('text')
   .text(d=>d)
   .style("font-family", "Roboto Mono")
   .style("font-size", heatmapFontSize + 'px') //font_size
   .classed('rotation', true)
   .attr('class', d => 'columnLabel '+d+'-mutation-hover-label')
   .attr('fill', 'black')
   .attr('x', d => xScale(d) + (square_side/2))
   .attr('y', margin.bottom - padding)
   .attr('transform', (d,i) => {
     //gives angle of rotation and also specifies the point that is rotated around
     return 'rotate(-60,'+(xScale(d)+(square_side/2))+','+(margin.bottom - padding)+')'
   })
   .on('mouseover', function(event, data) { createLinkedHighlighting(this, data)})
   .on('mouseout', function(event, data) { removeLinkedHighlighting(this, data)})

    //make the row and column titles
    svg.append('text')
    .attr('x', 40)
	.attr('y', height/2)
	.text(row_title)
	.attr('text-anchor', 'end')
     .style("font-family", "Roboto Mono")
   .style("font-size", font_size)
    .attr('transform', (d,i) => {
     //gives angle of rotation and also specifies the point that is rotated around
     return 'rotate(-90,'+20+','+height/2+')'
    })

    svg.append('text')
	.attr('x', width/2)
    .attr('y', 20)
	.text(column_title)
     .style("font-family", "Roboto Mono")
   .style("font-size", font_size)
    
    
  if (div.lastElementChild) {
    console.log("Remove a child");
    div.removeChild(div.lastElementChild);
  }
  console.log(svg.node());
  div.append(svg.node());
}
