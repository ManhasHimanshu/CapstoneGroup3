from ultralytics import YOLO
import cv2
import numpy as np

kalman = cv2.KalmanFilter(4, 2)

# State = [x, y, vx, vy]
kalman.transitionMatrix = np.array([
    [1, 0, 1, 0],
    [0, 1, 0, 1],
    [0, 0, 1, 0],
    [0, 0, 0, 1]
], dtype=np.float32)

kalman.measurementMatrix = np.eye(2, 4, dtype=np.float32)

kalman.processNoiseCov = np.eye(4, dtype=np.float32) * 0.03
kalman.measurementNoiseCov = np.eye(2, dtype=np.float32) * 0.25

model = YOLO("yolov8s.pt")
SPORTS_BALL_ID = 32

cap = cv2.VideoCapture("input.mp4")

while cap.isOpened():
    ret, frame = cap.read()
    if not ret:
        break

    prediction = kalman.predict()
    pred_x, pred_y = int(prediction[0]), int(prediction[1])

    results = model(frame, verbose=False)

    detected_ball = False
    meas = None 

    for r in results:
        for box in r.boxes:
            cls = int(box.cls[0])
            if cls == SPORTS_BALL_ID:
                x1, y1, x2, y2 = map(int, box.xyxy[0])
                
                # Draw YOLO box (green)
                cv2.rectangle(frame, (x1, y1), (x2, y2), (0,255,0), 2)

                # Calculate center for Kalman
                cx = (x1 + x2) // 2
                cy = (y1 + y2) // 2
                meas = np.array([[np.float32(cx)], [np.float32(cy)]])
                detected_ball = True

    if detected_ball:
        kalman.correct(meas)
        use_x, use_y = int(meas[0]), int(meas[1])
    else:
        use_x, use_y = pred_x, pred_y

    cv2.circle(frame, (use_x, use_y), 8, (255,0,0), -1)
    cv2.putText(frame, "Kalman", (use_x+10, use_y),
                cv2.FONT_HERSHEY_SIMPLEX, 0.5, (255,0,0), 2)

    # cv2.circle(frame, (pred_x, pred_y), 5, (0,255,255), -1)

    cv2.imshow("Ball Tracking (YOLO + Kalman)", frame)
    if cv2.waitKey(1) & 0xFF == ord('q'):
        break

cap.release()
cv2.destroyAllWindows()



'''
New Strategy

While True:
	
	- Run CHT searching for initial detection in centre of frame

	last_ball = 0

	While Ball Found:

		- Run YOLO/Kalmann strategy

		If Ball not Found: last_ball++

		If last_ball == x: break
