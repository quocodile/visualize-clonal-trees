'''
Takes in a Newick string, the current node that is being parsed, and the output file and chooses whether to call the base case, find the next substrings (children) of the current node, or find the next node
'''
def parse_next(newick_string, current_node, output):
    if ',' not in newick_string and '(' not in newick_string or (newick_string[0] == "{" and newick_string[-1] == "}"):
        print("base case")
        base_case(newick_string, current_node, output)
    elif newick_string[0] == "(" and newick_string[-1] == ')':
        find_substrings(newick_string, current_node, output)
    else:
        find_next_node(newick_string, current_node, output)
   
'''
Takes in a Newick string, the current node that is being parsed, and the output file and parses the singular node depending on whether it has a singular label or multiple labels
'''
def base_case(newick_string, current_node, output):
    
    #The node has a singular label and is surrounded by parenthesis
    if '{' not in newick_string and newick_string[0] == "(" and newick_string[-1] == ")":
        
        newick_string = str(newick_string[1:-1])
        output.write("\t" + str(newick_string) + " [label=\"" + newick_string + "\"];\n")
        output.write("\t" + str(current_node) + " -> " + str(newick_string) + ";\n")
    
    #The node has a singular label and is not surrounded by parenthesis
    elif '{' not in newick_string:
        
        output.write("\t" + str(newick_string) + " [label=\"" + newick_string + "\"];\n")
        output.write("\t" + str(current_node) + " -> " + str(newick_string) + ";\n")
        
    #The node has multiple labels
    else:
        
        node_trimmed = newick_string[1:-1]
        labels = node_trimmed.split(',')
        delim = ","
        all_labels = delim.join(labels)
        delim_name = "_"
        node_name = delim_name.join(labels)
        output.write("\t" + str(node_name) + " [label=\"" + all_labels + "\"];\n")
        output.write("\t" + str(current_node) + " -> " + str(node_name) + ";\n")
        

'''
Takes in a Newick string, the current node that is being parsed, and the output file, and finds the next substrings to parse.
'''
def find_substrings(newick_string, current_node, output):
    newick_string = newick_string[1:-1]
    substrings = []
    ignore_comma = False
    curr_substring = ''
    num_opens = 0
    
    #find all substrings
    for j in newick_string:
        if j == '(' or j == "{":
            ignore_comma = True
            curr_substring = curr_substring + j
            num_opens += 1
        elif j == ')' or j == "}":
            num_opens -= 1
            if num_opens == 0:
                ignore_comma = False
            curr_substring = curr_substring + j
        elif j == "," and not ignore_comma:
            substrings.append(curr_substring)
            curr_substring = ''
        elif j == "," and ignore_comma:
            curr_substring = curr_substring + j
        elif j != ',':
            curr_substring = curr_substring + j
    substrings.append(curr_substring)


    #Parse all the substrings indivudually
    for i in substrings:                
        parse_next(i, current_node, output)

'''
Takes in a Newick string, the current node that is being parsed, and the output file, and finds the next node to parse.
'''
def find_next_node(newick_string, current_node, output):    
    #If we are at the root of the tree, find the root and parse the next string
    if ')' in newick_string:
        substrings = newick_string.split(')')
        
        next_node = substrings[-1]
        
        #Parse the root if it is multi-labelled
        if next_node[0] == "{" and next_node[-1] == '}':
            node_trimmed = next_node[1:-1]
            labels = node_trimmed.split(',')
            delim = ","
            all_labels = delim.join(labels)
            delim_name = "_"
            node_name = delim_name.join(labels)
            if current_node is not None:
                output.write("\t" + str(current_node) + " -> " + str(node_name) + ";\n")
            output.write("\t" + str(node_name) + " [label=\"" + all_labels + "\"];\n")
            reverse_newick = newick_string[::-1].replace(next_node[::-1], "", 1)
            label_without_root = reverse_newick[::-1]
            parse_next(label_without_root, node_name, output)
            
        #Parse the root if it is not multi-labelled
        else:
            if current_node is not None:
                output.write("\t" + str(current_node) + " -> " + str(next_node) + ";\n")
            output.write("\t" + str(next_node) + " [label=\"" + next_node + "\"];\n")
            reverse_newick = newick_string[::-1].replace(next_node[::-1], "", 1)
            label_without_root = reverse_newick[::-1]
            parse_next(label_without_root, next_node, output)
            
    #If there are no substrings, find the next node and go into the base case
    elif '}' in newick_string:
        substrings = newick_string.split('}')
        
        next_node = substrings[-1]
        #newick_string = newick_string.replace(next_node, "")
        print(f"I am remove {next_node}")
        print(f"Current: {current_node}")
        print(f"Newick string: {newick_string}")
        newick_string = newick_string[::-1].replace(next_node[::-1], "", 1)[::-1]
        print(f"Newic string: {newick_string}")
        output.write("\t" + str(current_node) + " -> " + str(next_node) + ";\n")
        base_case(newick_string, next_node, output)

'''
Writes the first line
'''
def write_first_line(output):
    output.write("digraph Tree {\n")

'''
Writes the last line
'''
def write_last_line(output):
    output.write("}")

def convert_newick_2_dot(newick_string):
    newick_string = newick_string.replace(" ", "")
    newick_string = newick_string.replace(";", "")
    dot_string = ""
    dot_string = dot_string + "{"

    output = open("newick_2_dot_tree.txt", "w")

    write_first_line(output)
    parse_next(newick_string, None, output)
    write_last_line(output)
    
    #Write in correct order
    output = open("newick_2_dot_tree.txt", "r+")
    output_lines = output.readlines()

    name_lines = []
    pc_lines = []
    for i in output_lines[1:-1]:
        if "label" in i:
            name_lines.append(i)
        else:
            pc_lines.append(i)
    output.truncate(0)
    output.seek(0)

    final_string = "digraph Tree {\n"
    
    output.write(output_lines[0])
    for i in name_lines:
        #print(i)
        final_string = final_string + i
    for j in pc_lines:
        #print(j)
        final_string = final_string + j

    final_string = final_string + "}"

    removed_newlines = ""
    for i in final_string:
      if i != "\n":
        removed_newlines+=i
    print(f"This is the final string {final_string}\n")
    print(f"This is the final string with newlines removed {removed_newlines}\n")
    #return final_string
    return removed_newlines




#functions for alphabetizing across siblings

def flatten(this_string):
    flattened = ""
    for word in this_string:
        flattened += word + ","

    flattened = flattened[:-1].strip(" ")

    return flattened

def get_root(subtree):
    
    root_index = subtree.rfind(")")
    root = subtree[root_index + 1:]

    return root

def condense_nodes(tree):

    tree = tree.replace(" ", "")
    
    node_candidates = tree.split("{")

    node_dict = {}

    if len(node_candidates) == 1:
        return tree, False

    node_candidates = node_candidates[1:] #because first char shouldn't ever be {

    for node_candidate in node_candidates:
        
        end_index = node_candidate.rfind("}")
        node_id = node_candidate[:end_index]
        
        sorted_node = sorted(node_id.split(","))
        first_mutation = sorted_node[0]
        node_contents = flatten(sorted_node)

        node_dict[first_mutation] = ("{" + node_id + "}", "{" + node_contents + "}")

        
    for node_key in node_dict:
        tree = tree.replace(node_dict[node_key][0], node_key)

    return tree, node_dict


def expand_nodes(tree, node_dict):

    for node_key in node_dict:
        tree = tree.replace(node_key, node_dict[node_key][1])

    return tree

def alphabetize(tree):

    #just need to figure out how to handle nodes with multiple mutations

    root_index = tree.rfind(")")

    if root_index == -1:

        #base case:  either one leaf node or several sibling leaves

        leaves = sorted(tree.split(","))

        return flatten(leaves)

    
    root = tree[root_index + 1:]

    subtree = tree[1:root_index]

    parens = 0

    siblings = []
    sibling_index = 0


    #want to identify siblings
    for i in range(len(subtree)):
        
        if subtree[i] == "(":
            parens += 1
        if subtree[i] == ")":
            parens -= 1

        #only a sibling if parens are matched and there's a comma
        if subtree[i] == "," and parens == 0:
            
            sibling = subtree[sibling_index:i]
            
            siblings.append(sibling)
            sibling_index = i+1 
            
    siblings.append(subtree[sibling_index:])
    
    sorted_siblings = sorted(siblings, key=get_root)

    merged_string = ""

    for sibling in sorted_siblings:
        merged_string += alphabetize(sibling) + ","

    merged_string = merged_string[:-1]
    
    return "(" + merged_string + ")" + root


#wrapper function for all of the alphabetizing steps
def alphabetize_data(data):

    new_tree, node_dict = condense_nodes(data)

    ordered_data = alphabetize(new_tree)

    if node_dict == False:
        return ordered_data

    alphabetized_data = expand_nodes(ordered_data, node_dict)

    #print(alphabetized_data)

    return alphabetized_data
