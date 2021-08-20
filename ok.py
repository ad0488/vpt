import sys
import numpy as np
from sklearn.decomposition import PCA
from sklearn.preprocessing import StandardScaler
import simplejson as json

if __name__ == '__main__':
    x = sys.argv[1]
    y = sys.argv[2]

    sv = 0
    volumes = ['aneurism', 'angio', 'bonsai', 'boston_teapot', 'brain',
               'coronal_fem', 'coronal_mal', 'csafe_heptane', 'ct_knee',
               'engine', 'foot', 'kidney', 'monkey_ct', 'mri_head',
               'skull', 'statue_leg', 'subclavia']

    for item in range(len(volumes)):
        if volumes[item] == x:
            sv = item
	
	print('we here')
    print(x)
    print(y)
    # print(endlist[0][0])
    # print('random bullshit')

    sys.stdout.flush()
