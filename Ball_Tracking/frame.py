import cv2
import numpy as np

class frame:
    
    def __init__(self, image, circles):
        self.image = image
        self.circles = circles

    def get_image(self):
        return self.image

    def get_circles(self):
        return self.circles

    def set_circles(self, new_circles):
        self.circles = new_circles

    def get_dimensions(self):
        height, width = self.image.shape[:2]
        return height, width
