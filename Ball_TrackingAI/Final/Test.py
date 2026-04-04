import cv2
import numpy as np
from ultralytics import YOLO
from collections import deque
import time

# ── Config ────────────────────────────────────────────────────────────────────
MODEL        = r"C:\Github\CapstoneGroup3\Ball_TrackingAI\Final\model\Android_Hernandez.pt"       # swap to .engine on Jetson
CAMERA       = 0
WIDTH        = 640
HEIGHT       = 640
TRAIL_LEN    = 40                    # frames to keep in trail
MIN_POINTS   = 6                     # minimum detections before drawing trail
MIN_DISP     = 80                    # min pixel displacement to count as pitch

# ── Setup ─────────────────────────────────────────────────────────────────────
model  = YOLO(MODEL, task="detect")
cap    = cv2.VideoCapture(CAMERA, cv2.CAP_DSHOW)
cap.set(cv2.CAP_PROP_FRAME_WIDTH,  WIDTH)
cap.set(cv2.CAP_PROP_FRAME_HEIGHT, HEIGHT)

out = cv2.VideoWriter(
    f"session_{time.strftime('%Y%m%d_%H%M%S')}.mp4",
    cv2.VideoWriter_fourcc(*'mp4v'), 30.0, (WIDTH, HEIGHT)
)

trail     = deque(maxlen=TRAIL_LEN)
lost      = 0

# ── Loop ──────────────────────────────────────────────────────────────────────
while True:
    ret, frame = cap.read()
    if not ret:
        break

    # Detection
    boxes = model(frame, imgsz=640, conf=0.01, verbose=False)[0].boxes
    if boxes and len(boxes):
        best       = max(boxes, key=lambda b: float(b.conf[0]))
        x1,y1,x2,y2 = map(int, best.xyxy[0])
        cx, cy     = (x1+x2)//2, (y1+y2)//2
        trail.append((cx, cy))
        lost = 0
        cv2.rectangle(frame, (x1,y1), (x2,y2), (255,255,255), 2)
    else:
        lost += 1
        if lost > 8:
            trail.clear()

    # Trail overlay — only if trajectory qualifies as a pitch
    if len(trail) >= MIN_POINTS:
        dx = trail[-1][0] - trail[0][0]
        dy = trail[-1][1] - trail[0][1]
        if np.hypot(dx, dy) >= MIN_DISP:
            for i in range(1, len(trail)):
                alpha = i / len(trail)
                cv2.line(frame, trail[i-1], trail[i],
                         (0, int(255*alpha), int(255*(1-alpha))), 2)

    out.write(frame)
    cv2.imshow("Ball Tracker", frame)
    if cv2.waitKey(1) & 0xFF == ord('q'):
        break

cap.release()
out.release()
cv2.destroyAllWindows()