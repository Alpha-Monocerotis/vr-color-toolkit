import argparse
import skimage.io as io
from collections import Counter

if __name__ == '__main__':
    parser = argparse.ArgumentParser()
    parser.add_argument('mhd_path', type=str, help='mhd path')
    args = parser.parse_args()
    img = io.imread(args.mhd_path, plugin='simpleitk')
    record = dict()
    page, w, h = img.shape
    img = img.flatten()
    print(Counter(img))