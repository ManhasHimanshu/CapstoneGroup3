import cv2
import numpy as np
from ultralytics import YOLO
from pathlib import Path
from PIL import Image, ImageOps
import os
import time
from sort import Sort
from collections import defaultdict, deque

#============ Setup ============#

MODEL_PATH = r"C:\Users\manha\Documents\GitHub\CapstoneGroup3\Ball_TrackingAI\Final\model\Android_Hernandez.pt"
WIDTH        = 1280
HEIGHT       = 720
MAX_GAP      = 4
MIN_DETECT   = 2
CONF_THRESH  = 0.01
TRAIL_LEN    = 40
MIN_POINTS   = 6
MIN_DISP     = 80
#=========== Methods ===========#

def preprocess(frame):

    img = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB) # Convert to RGB format

    img = Image.fromarray(img) # Convert image format

    img = ImageOps.exif_transpose(img)

    img = np.array(img) # Reconvert to np array

    img = cv2.resize(img, (640, 640), interpolation=cv2.INTER_LINEAR) #Strech to 640x640
    
    # Clahe normalization
    lab = cv2.cvtColor(img, cv2.COLOR_RGB2LAB)
    l, a, b = cv2.split(lab)

    clahe = cv2.createCLAHE(clipLimit=2.0, tileGridSize=(8, 8))
    l = clahe.apply(l)

    lab = cv2.merge((l, a, b))
    img = cv2.cvtColor(lab, cv2.COLOR_LAB2BGR) # Reconvert to BGR

    return img

def run_detection(frame, model, conf):

    proc_img = preprocess(frame)

    res = model.predict(
            source=proc_img,
            imgsz=640,
            conf=conf,
            verbose=False
        )
    
    return res

def draw_trails(frame, trails, scale_x, scale_y):
    for tid, trail in trails.items():
        if len(trail) < MIN_POINTS:
            continue
        # Scale trail points back to display resolution
        pts = [(int(x * scale_x), int(y * scale_y)) for x, y in trail]
        dx = pts[-1][0] - pts[0][0]
        dy = pts[-1][1] - pts[0][1]
        if np.hypot(dx, dy) < MIN_DISP:
            continue
        for i in range(1, len(pts)):
            alpha = i / len(pts)
            cv2.line(frame, pts[i-1], pts[i],
                     (0, int(255*alpha), int(255*(1-alpha))), 2)

#============ Main ============#

def main():
    model   = YOLO(MODEL_PATH)
    tracker = Sort(max_age=MAX_GAP, min_hits=MIN_DETECT, iou_threshold=0)

    save_dir = r"C:\Users\manha\Desktop\School\Winter 2026\CEG 4913"
    os.makedirs(save_dir, exist_ok=True)
    filename = os.path.join(save_dir, f"session_{time.strftime('%Y%m%d_%H%M%S')}.mp4")
    print(f"[INFO] Saving to: {filename}")

    #cap = cv2.VideoCapture(0, cv2.CAP_DSHOW)
    CAMERA_INDEX = 1   # try 1 first, then 2 if needed
    cap = cv2.VideoCapture(CAMERA_INDEX, cv2.CAP_DSHOW)
    cap.set(cv2.CAP_PROP_FRAME_WIDTH,  WIDTH)
    cap.set(cv2.CAP_PROP_FRAME_HEIGHT, HEIGHT)

    out = cv2.VideoWriter(
        filename,
        cv2.VideoWriter_fourcc(*'mp4v'), 30.0, (WIDTH, HEIGHT)
    )

    if not out.isOpened():
        print("ERROR: VideoWriter failed to open")
        return

    # Per-track trail buffers
    trails = defaultdict(lambda: deque(maxlen=TRAIL_LEN))

    # YOLO runs on 640x640, display is WIDTH x HEIGHT — need to scale boxes back
    scale_x = WIDTH  / 640
    scale_y = HEIGHT / 640

    try:
        while True:
            ret, frame = cap.read()
            if not ret:
                print("[WARN] Failed to read frame")
                break

            display = cv2.resize(frame, (WIDTH, HEIGHT))
            cv2.imshow("Ball Tracker", display)

            if cv2.waitKey(1) & 0xFF == ord('q'):
                break

            res  = run_detection(frame, model, CONF_THRESH)
            boxes = res[0].boxes

            # Draw ALL raw detections
            if boxes and len(boxes):
                for b in boxes:
                    x1, y1, x2, y2 = map(float, b.xyxy[0])
                    rx1, ry1 = int(x1 * scale_x), int(y1 * scale_y)
                    rx2, ry2 = int(x2 * scale_x), int(y2 * scale_y)
                    conf = float(b.conf[0])

                    cv2.rectangle(frame, (rx1, ry1), (rx2, ry2), (0, 255, 0), 1)
                    cv2.putText(frame, f"{conf:.2f}", (rx1, ry1 - 5),
                                cv2.FONT_HERSHEY_SIMPLEX, 0.4, (0, 255, 0), 1)

            # Build detections for SORT
            if boxes and len(boxes):
                dets = np.array([
                    [*map(float, b.xyxy[0]), float(b.conf[0])]
                    for b in boxes
                ])
            else:
                dets = np.empty((0, 5))

            tracks = tracker.update(dets)

            for t in tracks:
                x1, y1, x2, y2, tid = map(int, t)
                cx, cy = (x1 + x2) // 2, (y1 + y2) // 2

                trails[tid].append((cx, cy))

                rx1, ry1 = int(x1 * scale_x), int(y1 * scale_y)
                rx2, ry2 = int(x2 * scale_x), int(y2 * scale_y)

                cv2.rectangle(frame, (rx1, ry1), (rx2, ry2), (255, 255, 255), 2)
                cv2.putText(frame, f"ID {tid}", (rx1, ry1 - 5),
                            cv2.FONT_HERSHEY_SIMPLEX, 0.5, (255, 255, 255), 1)

            draw_trails(frame, trails, scale_x, scale_y)

            display = cv2.resize(frame, (WIDTH, HEIGHT))
            out.write(display)
            cv2.imshow("Ball Tracker", display)
            
            if cv2.waitKey(1) & 0xFF == ord('q'):
                break

    except KeyboardInterrupt:
        print("\n[INFO] Interrupted by user. Saving video...")

    finally:
        cap.release()
        out.release()
        cv2.destroyAllWindows()
        print("[INFO] Video saved successfully.")

if __name__ == "__main__":
    main()