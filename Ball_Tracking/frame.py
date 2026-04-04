import cv2
import numpy as np

class frame:
    
    def __init__(self, image, circles):
        # normalize circles on construction
        self.image = image
        self.circles = self._normalize(circles)

    def _normalize(self, circles):
        if circles is None:
            return []
        circles = np.array(circles)
        if circles.size == 0:
            return []
        return circles.reshape(-1, 3)

    def get_image(self):
        return self.image

    def get_circles(self):
        return self.circles if len(self.circles) else []

    def set_circles(self, new_circles):
        self.circles = self._normalize(new_circles)

    def get_dimensions(self):
        height, width = self.image.shape[:2]
        return height, width
