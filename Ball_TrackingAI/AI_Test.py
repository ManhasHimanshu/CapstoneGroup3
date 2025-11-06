## r"C:\Github\CapstoneGroup3\Ball_Tracking\Videos\test_vid6"

import torch
import cv2

# -----------------------------
# LOAD YOLOv5
# -----------------------------
print("Loading YOLOv5...")
model = torch.hub.load("ultralytics/yolov5", "yolov5s", pretrained=True)
model.classes = [32]  # COCO 'sports ball' class only

# -----------------------------
# VIDEO FILE PATH
# -----------------------------
video_path = r"C:\Github\CapstoneGroup3\Ball_Tracking\Videos\test_vid6.mp4"
cap = cv2.VideoCapture(video_path)

if not cap.isOpened():
    print(f"❌ ERROR: Could not open video file: {video_path}")
    exit()

trail_points = []

# -----------------------------
# PROCESS VIDEO
# -----------------------------
while True:
    ret, frame = cap.read()
    if not ret:
        print("✅ Video finished")
        break

    # Run YOLOv5 inference
    results = model(frame)
    detections = results.xyxy[0]

    ball_center = None

    # Only consider detected sports ball(s)
    for *xyxy, conf, cls in detections:
        x1, y1, x2, y2 = map(int, xyxy)
        cx, cy = (x1 + x2)//2, (y1 + y2)//2
        ball_center = (cx, cy)

        # Draw bounding box
        cv2.rectangle(frame, (x1, y1), (x2, y2), (0, 255, 0), 2)
        cv2.circle(frame, ball_center, 5, (0, 0, 255), -1)
        cv2.putText(frame, f"Ball {conf:.2f}", (x1, y1-10),
                    cv2.FONT_HERSHEY_SIMPLEX, 0.6, (0, 255, 0), 2)

    # Save trail points to show trajectory
    if ball_center:
        trail_points.append(ball_center)

    for i in range(1, len(trail_points)):
        cv2.line(frame, trail_points[i-1], trail_points[i], (255, 0, 0), 2)

    # Display frame
    cv2.imshow("Baseball YOLO Tracker", frame)
    if cv2.waitKey(1) & 0xFF == ord('q'):
        break

cap.release()
cv2.destroyAllWindows()

