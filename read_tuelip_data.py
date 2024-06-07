
def read_in_file():

    f = open("trial1.txt", "r")
    for line in f.readlines():
        print(line)

read_in_file()
