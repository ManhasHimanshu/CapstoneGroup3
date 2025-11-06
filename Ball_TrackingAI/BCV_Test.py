
import cv2
from ultralytics import YOLO

# --- CONFIG ---
video_path = r"C:\Github\CapstoneGroup3\Ball_Tracking\Videos\test_vid8.mp4"
save_output = True
output_path = r"C:\Github\CapstoneGroup3\Ball_Tracking\Videos\output_yolo.mp4"

# --- LOAD YOLO MODEL ---
model_path = r"models/od/YOLO/ball_tracking/model_weights/ball_tracking.pt"
print(f"Loading YOLO model from {model_path}...")
model = YOLO(model_path)
print("YOLO model loaded successfully.")

# --- OPEN VIDEO ---
cap = cv2.VideoCapture(video_path)
if not cap.isOpened():
    raise RuntimeError(f"Could not open video: {video_path}")

frame_width = int(cap.get(cv2.CAP_PROP_FRAME_WIDTH))
frame_height = int(cap.get(cv2.CAP_PROP_FRAME_HEIGHT))
fps = cap.get(cv2.CAP_PROP_FPS)

if save_output:
    fourcc = cv2.VideoWriter_fourcc(*'mp4v')
    out = cv2.VideoWriter(output_path, fourcc, fps, (frame_width, frame_height))

print("Processing video...")

frame_count = 0
while True:
    ret, frame = cap.read()
    if not ret:
        break
    frame_count += 1

    # --- RUN PREDICTION ---
    results = model(frame)  # returns a YOLO object with .boxes, .masks, etc.

    # --- DRAW BOXES ---
    for result in results:
        for box in result.boxes.xyxy:  # x1, y1, x2, y2
            x1, y1, x2, y2 = map(int, box)
            cv2.rectangle(frame, (x1, y1), (x2, y2), (0, 255, 0), 2)

    if save_output:
        out.write(frame)

cap.release()
if save_output:
    out.release()
cv2.destroyAllWindows()
print(f"Finished processing {frame_count} frames. Output saved to {output_path}")


