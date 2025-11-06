import cv2
from ultralytics import YOLO
import os
import numpy as np

dir_path = r"C:\Github\CapstoneGroup3\Ball_Tracking\Videos"
vid_name = "test_vid8"

## MODEL SETUP ##
model_path = r"models/od/YOLO/ball_tracking/model_weights/ball_tracking.pt"
save_output = True
model = YOLO(model_path)

## VIDEO SETUP ##
cap = cv2.VideoCapture(os.path.join(dir_path,vid_name + ".mp4"))
if not cap.isOpened():
    raise RuntimeError(f"Could not open video")

frame_width = int(cap.get(cv2.CAP_PROP_FRAME_WIDTH))
frame_height = int(cap.get(cv2.CAP_PROP_FRAME_HEIGHT))
fps = cap.get(cv2.CAP_PROP_FPS)

if save_output:
    fourcc = cv2.VideoWriter_fourcc(*'mp4v')
    out = cv2.VideoWriter(os.path.join(dir_path, vid_name + "_out.mp4"), fourcc, fps, (frame_width, frame_height))

ball_x, ball_y = 0
ball_found = False

while True:

    ret, frame = cap.read()
    if not ret: break

    if ball_found: sub_frame = frame[ball_y-50:ball_y+50, ball_y-50:ball_y+50]
    else: sub_frame = frame

    results = model(sub_frame)
    
    for result in results:
        for box, cls in zip(result.boxes.xyxy, result.boxes.cls):
            class_name = result.names[int(cls)]


            if class_name == "ball":

                ball_found = True

                x1, y1, x2, y2 = map(int, box)

                if ball_found:


                cv2.rectangle(frame, (x1, y1), (x2, y2), (0, 255, 0), 2)

'''
frame_count = 0
while True:
    ret, frame = cap.read()
    if not ret:
        break
    frame_count += 1

    ## Insert Accuracy Filters
    

    results = model(frame)

    for result in results:
        for box in result.boxes.xyxy: 
            x1, y1, x2, y2 = map(int, box)
            cv2.rectangle(frame, (x1, y1), (x2, y2), (0, 255, 0), 2)

    if save_output:
        out.write(frame)

cap.release()
if save_output:
    out.release()
cv2.destroyAllWindows()
'''