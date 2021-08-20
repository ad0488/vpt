import sys
import numpy as np
from sklearn.decomposition import PCA
from sklearn.preprocessing import StandardScaler
import simplejson as json

if __name__ == '__main__':

    # x = sys.argv[1]
    # y = sys.argv[2]

    sv = 0
    volumes = ['aneurism', 'angio', 'bonsai', 'boston_teapot', 'brain',
               'coronal_fem', 'coronal_mal', 'csafe_heptane', 'ct_knee',
               'engine', 'foot', 'kidney', 'monkey_ct', 'mri_head',
               'skull', 'statue_leg', 'subclavia']

    x = 'csafe_heptane'
    y = '[{"position":{"x":0.5,"y":0.5},"size":{"x":0.2,"y":0.2},"color":{"r":1,"g":0,"b":0,"a":1}},' \
        ' {"position":{"x":0.6,"y":0.6},"size":{"x":0.2,"y":0.2},"color":{"r":1,"g":0,"b":0,"a":1}}]'

    for item in range(len(volumes)):
        if volumes[item] == x:
            sv = item

    loaded = np.load('data.npy', allow_pickle=True)

    vollist = loaded[sv]

    # vollist = [[0.50, 0.50, 0.20, 0.20], [0.51, 0.51, 0.21, 0.21],
    #            [0.51, 0.51, 0.21, 0.22], [0.52, 0.53, 0.24, 0.25],
    #            [0.60, 0.60, 0.30, 0.30], [0.65, 0.65, 0.35, 0.35],
    #            [0.69, 0.69, 0.39, 0.39], [0.79, 0.79, 0.09, 0.09],
    #            [0.90, 0.90, 0.40, 0.40], [0.90, 0.90, 0.40, 0.40],
    #            [0.501, 0.501, 0.201, 0.201], [0.502, 0.502, 0.202, 0.202]]

    meanlist = []

    meanmega = []

    finallist = []

    gr8list = []

    indexes = []

    endlist = []

    pac = json.loads(y)

    length = len(pac)

    for n in range(length):
        curblob = pac[n]
        pos = curblob['position']
        el0 = pos['x']
        el1 = pos['y']

        size = curblob['size']
        el2 = size['x']
        el3 = size['y']

        vollist.insert(0, [el0, el1, el2, el3])

    X = np.array(vollist)
    Xmean = np.mean(X, axis=0)
    pca = PCA(n_components=2)
    # Q = StandardScaler().fit_transform(X)
    Y = pca.fit_transform(X)
    Z = np.ndarray.tolist(Y)

    for n in range(length):
        meanlist.append(Z[n])
        Z.pop(n)

    meanlist = np.mean(meanlist, axis=0).tolist()

    meanmega = np.mean(Z, axis=0).tolist()

    dist_best = 100

    for n in range(len(Z)):
        dist = np.linalg.norm(np.array(meanlist) - np.array(Z[n]))
        if dist < dist_best or n < 5:
            dist_best = dist
            finallist.append([Z[n], n])

    for n in range(5):
        gr8list.append(finallist[-n - 1])
        indexes.append(gr8list[n][1])

    n = 2
    inv = np.dot(pca.transform(X)[:, :n], pca.components_[:n, :])
    inv += Xmean

    for n in range(5):
        endlist.append(inv[indexes[n] + length])

    print(endlist)
    sys.stdout.flush()

