'''
    Tree CS COMPs
'''
import sys
import flask
import json
sys.path.append('py_scripts')
import check_input
import os
import pydot
import py_scripts.parent_child_dot as pc_dot 

api = flask.Blueprint('api', __name__)

@api.route('/showTreeFromDot/<dot_fname>')
def view_tree(dot_fname):
    dot_fpath = "examples/" + dot_fname

    str_cycle = check_input.cycle_detection(dot_fpath) # will be empty if no cycle

    print(str_cycle)

    if len(str_cycle) == 0:
        graph = pydot.graph_from_dot_file(dot_fpath)[0]
        graph.write_png('static/static-img/tree-display.png')

    return json.dumps(str_cycle)

@api.route('/cats/') 
def get_cats():
    # Of course, your API will be extracting data from your postgresql database.
    # To keep the structure of this tiny API crystal-clear, I'm just hard-coding data here.
    cats = [{'name':'Emma', 'birth_year':1983, 'death_year':2003, 'description':'the boss'},
            {'name':'Aleph', 'birth_year':1984, 'death_year':2002, 'description':'sweet and cranky'},
            {'name':'Curby', 'birth_year':1999, 'death_year':2000, 'description':'gone too soon'},
            {'name':'Digby', 'birth_year':2000, 'death_year':2018, 'description':'the epitome of Cat'},
            {'name':'Max', 'birth_year':1998, 'death_year':2009, 'description':'seismic'},
            {'name':'Scout', 'birth_year':2007, 'death_year':None, 'description':'accident-prone'}]
    return json.dumps(cats)

@api.route('/dogs/') 
def get_dogs():
    dogs = [{'name':'Ruby', 'birth_year':2003, 'death_year':2016, 'description':'a very good dog'},
            {'name':'Maisie', 'birth_year':2017, 'death_year':None, 'description':'a very good dog'}]
    return json.dumps(dogs)

@api.route('/parent_child_distance')
def run_parent_child_distance():
  """
  Required:
    - N/A 
  Returns:
    - JSON object containing edges involved in
      the calculation of parent-child distance

  Note:
    This url that invokes this route should have
    two GET parameters, one that includes the
    Newick string representing tree1 and a Newick
    string representing tree2 
  """
  tree1_dot = flask.request.args.get('tree1') 
  tree2_dot = flask.request.args.get('tree2') 
  temp_t1 = open("t1.txt", "w")
  temp_t2 = open("t2.txt", "w")
  temp_t1.write(tree1_dot)
  temp_t2.write(tree2_dot)
  temp_t1.close()
  temp_t2.close()
  tree1 = pc_dot.read_dot_file("t1.txt")
  tree2 = pc_dot.read_dot_file("t2.txt")
  tree1_edges, tree2_edges, unshared_edges, dist = pc_dot.calculate_parent_child_distance(tree1, tree2) 
  unshared_edges = [{"source": edge[1], "target": edge[0]} for edge in unshared_edges]
  tree1_edges= [{"source": edge[1], "target": edge[0]} for edge in tree1_edges]
  tree2_edges= [{"source": edge[1], "target": edge[0]} for edge in tree2_edges]
  jsonObject = {
                 "tree1_edges": tree1_edges,
                 "tree2_edges": tree2_edges,
                 "unshared_edges": unshared_edges,
                 "pc_distance": dist
               }
  return(json.dumps(jsonObject))
  

