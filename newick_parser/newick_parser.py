import json

def parser_newick(string):
  if len(string) == 0: 
    #return {'root': string, 'children': None}
    return 
  string = string.strip()
  string = string.replace(" ", "")
  string = string.replace(";", "")
  root_removed = ""
  # find the root of subtree
  root = ""
  if ")" in string:
    for i in range(len(string) - 1, 0, -1):
      cur = string[i]
      if (cur != ")"):
        root += cur
      else:
        root_removed = string[0:i+1]
        for j, char in enumerate(root):
          if char == "{":
            root = root[0:j] + "}" + root[j+1:] 
          if char == "}":
            root = root[0:j] + "{" + root[j+1:] 
        if "{" in root:
          root = root.replace("{", "")
          root = root.replace("}", "")
          mutation_list = root.split(",") 
          mutation_list = ["".join(reversed(list(mut))) for mut in mutation_list]
          root = ",".join(mutation_list)
        root = root[::-1]
        break
  else:
    root = string
  # remove paren wrapping children if exists
  if len(root_removed) > 0 and root_removed[-1] == ")":
    root_removed = root_removed[1:-1]
  # get the children of the root
  children = [""]
  child_index = 0
  curly_stack = []
  paren_stack = []
  for i, char in enumerate(root_removed):
    if char == ",":
      if len(curly_stack) == 0 and len(paren_stack) == 0:
        child_index += 1
        children.append("")
      else:
        children[child_index] += "," 
    else: 
      if char == "{":
        curly_stack.append("{")
      if char == "}":
        curly_stack.pop()
      if char == "(":
        paren_stack.append("(")
      if char == ")":
        paren_stack.pop()
      children[child_index] += char
  # recurse on children 
  links = []
  for child in children:     
    child = parser_newick(child)
    links.append(child)
  return [{'root': root, 'children': links}]
  
def post_order_traversal(parsed_newick):
  for child in parsed_newick[0]['children']:
    if child:
      post_order_traversal(child) 
  print(parsed_newick[0]['root'])

def get_all_ancestral_sets(parsed_newick, level_ancestors, ancestral_set):
  root_mutations = parsed_newick[0]['root'].replace("{", "").replace("}", "").split(",")
  for mut in root_mutations:
    level_ancestors.append(mut)
  cur_ancestors = level_ancestors[::]
  # add all the mutations at this level to the current ancestors
  # if a leaf node
  if parsed_newick[0]['children'] == [None]:
    cluster_mutations = parsed_newick[0]['root'].replace("}", "").replace("{", "").split(",")
    for mut in root_mutations:
      cur_ancestors = level_ancestors[::]
      for cluster_mut in cluster_mutations:
        if cluster_mut != mut:
          cur_ancestors.remove(cluster_mut)
      ancestral_set[mut] = cur_ancestors
  else:
    cluster_mutations = parsed_newick[0]['root'].split(",")
    for mut in parsed_newick[0]['root'].split(","):
      cur_ancestors = level_ancestors[::]
      for cluster_mut in cluster_mutations:
        if cluster_mut != mut:
          cur_ancestors.remove(cluster_mut)
      ancestral_set[mut] = cur_ancestors
    for child in parsed_newick[0]['children']:
      if child:
        get_all_ancestral_sets(child, level_ancestors[::], ancestral_set)
    
def get_mutations(parsed_newick, mutations):
  mutations += parsed_newick[0]['root'].replace("{", "").replace("}", "").split(",")
  if parsed_newick[0]['children'] == [None]: 
    return 
  for child in parsed_newick[0]['children']:
    if child:
      children_muts = get_mutations(child, mutations)
  return []

def get_caset_dist(parsed_newick1, parsed_newick2):
  pairs_considered = []
  contributing_edges = []
  mutations = []
  t1_anc_sets = {}
  t2_anc_sets = {}
  t1_ancestral = get_all_ancestral_sets(parsed_newick1, [], t1_anc_sets) 
  t2_ancestral = get_all_ancestral_sets(parsed_newick2, [], t2_anc_sets) 
  get_mutations(parsed_newick1, mutations)
  contributing_to_distance = []
  for i in mutations:
    for j in mutations:
      if {i, j} not in pairs_considered:
        pairs_considered.append({i, j})
        print(i, j)
        print(t1_anc_sets, t2_anc_sets)
        cas1 = set(t1_anc_sets[i]).intersection(set(t1_anc_sets[j]))
        cas2 = set(t2_anc_sets[i]).intersection(set(t2_anc_sets[j]))
        diff = cas1 ^ cas2
        if len(diff) > 0:
          #print(i, j, cas1)
          #print(i, j, cas2)
          #print(diff)
          for mut in diff:
            if mut in cas1:
              print("t1")
              contributing_edges.append((mut, i, "t1"))
              contributing_edges.append((mut, j, "t1"))
            else:
              print("t2")
              contributing_edges.append((mut, i, "t2"))
              contributing_edges.append((mut, j, "t2"))
            print("edges", i, j, mut)
          contributing_to_distance.append(diff)
        # common anc set t1 for i, j
  return contributing_edges
  
def get_visualization_object(contributing_edges, mutations): 
  t1_object = { 'edges': [], 'mutations': mutations }
  t2_object = { 'edges': [], 'mutations': mutations }
  for edge in contributing_edges:
    if edge[-1] == "t1":
      t1_object['edges'].append({'ancestor': edge[0], 'descendant': edge[1]})
    else:
      t2_object['edges'].append({'ancestor': edge[0], 'descendant': edge[1]})
  return t1_object, t2_object
    


#print(parser_newick("(B, C, D, E)A;", {}))
#print()
#print(parser_newick("(B, (N){AC, AP, AL}, D, E) A;")) 
#mutations = []
#get_mutations(parser_newick("(B, (N){AC, AP, AL}, D, E) A;"), mutations) 
#print("Mutations", mutations)
#post_order_traversal(parser_newick("(B, (N){AC, AP, AL}, D, E) A;")) 

#ancestral_sets = {} 
#get_all_ancestral_sets(parser_newick("(B, (N){AC, AP, AL}, D, E) A;"), [], ancestral_sets) 
#print(ancestral_sets)

#print(get_caset_dist(parser_newick("({A,B,C})J;"), parser_newick("((C){A,B})J;")))
''' BSCITE fig5a1 and fig5a2
#contributing_edges = get_caset_dist(parser_newick("((((EYA4) {BBS4, CAMSAP1, DOCK3, HIST1H2AG, RGS11, SMOC1, ZNF540, EPHA10, TUFT1, SERPINF2}) {PTPRQ, MYOM3, INTS8, PPIG2}) {TTN, HIPK4, OAZ3}) {MAL2, RYR3}"), parser_newick("((({BBS4, CAMSAP1, DOCK3, HIST1H2AG, RGS11, SMOC1, ZNF540, EPHA10, TUFT1, SERPINF2}) {PTPRQ, MYOM3, INTS8, PPIG2}) {TTN, HIPK4, OAZ3}, EYA4) {MAL2, RYR3};"))
print(contributing_edges)
mutations = []
get_mutations(parser_newick("((({BBS4, CAMSAP1, DOCK3, HIST1H2AG, RGS11, SMOC1, ZNF540, EPHA10, TUFT1, SERPINF2}) {PTPRQ, MYOM3, INTS8, PPIG2}) {TTN, HIPK4, OAZ3}, EYA4) {MAL2, RYR3};"), mutations) 
t1_object, t2_object = get_visualization_object(contributing_edges, mutations)
print(t1_object)
print(t2_object)
'''
# BSCITE fig5b and fig5c
contributing_edges = get_caset_dist(parser_newick("((((((((((ZNF540) MYOM3) PPIG) INTS8) TTN) SERPINF2) HIPK4) OAZ3) PTPRQ, ((((((((EYA4) SMOC1) CAMSAP1) RGS11) DOCK3) EPHA10) HIST1H2AG) BBS4) TUFT1) RYR3) MAL2;"), parser_newick("((((((((((ZNF540) MYOM3) PPIG) SERPINF2) INTS8) PTPRQ) OAZ3) HIPK4) TTN, ((((((((EYA4) CAMSAP1) SMOC1) RGS11) DOCK3) EPHA10) HIST1H2AG) BBS4) TUFT1) RYR3) MAL2;"))
mutations = []
get_mutations(parser_newick("((((((((((ZNF540) MYOM3) PPIG) SERPINF2) INTS8) PTPRQ) OAZ3) HIPK4) TTN, ((((((((EYA4) CAMSAP1) SMOC1) RGS11) DOCK3) EPHA10) HIST1H2AG) BBS4) TUFT1) RYR3) MAL2;"), mutations) 
t1_object, t2_object = get_visualization_object(contributing_edges, mutations)
print(t1_object)
print(t2_object)
