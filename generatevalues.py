"""
This script generates files in pkinfo directory.
it uses a csv file as input.
"""
from collections import namedtuple,OrderedDict

from itertools import count
import json

FILE_NAME = 'pk.csv'

Line = namedtuple('Line', ('city', 'county', 'district', 'providence', 'code'))

Node = namedtuple('Node', ('code', 'id', 'value'))


def to_json(self):
    res = {'model_id': self.id, 'code': self.code}
    if not isinstance(self.value, OrderedDict):
        res['value'] = self.value
    return res
Node.to_json = to_json

id_generator = count(1)


def processfile(file_name):
    cities = OrderedDict()
    for l in open(file_name):
        line = Line(*map(lambda x: x.strip(), (l.split(","))))

        #Create city if it does not exists
        if line.city not in cities:
            #Node for city has a ilce dict for
            cities[line.city] = Node(line.city,
                                     id_generator.next(),
                                     OrderedDict())
        city = cities[line.city]

        if line.county not in city.value:
            #Node for city has a ilce dict for
            city.value[line.county] = Node(line.county,
                                           id_generator.next(),
                                           OrderedDict())
        county = city.value[line.county]

        if line.district not in county.value:
            #Node for city has a ilce dict for
            county.value[line.district] = Node(line.district,
                                               id_generator.next(),
                                               OrderedDict())
        district = county.value[line.district]

        district.value[line.providence] = Node(line.providence,
                                               id_generator.next(),
                                               line.code)

    return cities


def generate_file(d, file_name):
    with open('pkinfo/'+file_name, 'w') as f:
        f.write(json.dumps(map(lambda x: x.to_json(),
                               d.values())))
    for i in d.values():
        if isinstance(i.value,OrderedDict):
            generate_file(i.value,str(i.id)+'.json')

def main():
    cities = processfile(FILE_NAME)
    generate_file(cities, 'cities.json')

    
if __name__ == '__main__':
    main()
