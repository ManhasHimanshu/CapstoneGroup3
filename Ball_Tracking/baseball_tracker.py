import cv2
import os
import numpy as np
import math
from frame import frame


'''
# video_path (string): Filepath to the folder containing the video to be processed
# video_name (string): Filename of the video to be processed
# frame_path (string): Filepath to the frame storage folder
# result_path (String): Filepath to the file which the tracked frames will be stored
#
# Runs the full process of tracking a baseball within a video. Order of opperations
# is as follows: Frame Extraction -> Frame Masking -> Mask Filtering -> File saving
'''
def run(video_path, video_name, frame_path, result_path):

    print("Extracting Frames...")
    count = extract_frames(video_path, video_name,frame_path)

    print("Generating Masks...")
    frames = mask_frames(frame_path, video_name, count)

    print("Filtering for Baseballs...")
    filter_baseballs(frames)

    print("Saving Tracked Images...")
    save_processed(frames, result_path, video_name)

    print("Results found at " + result_path)


'''
# frames (frame list): A sequential list of tracked frames. Each frame object contains
# a np array of circles of the format (y,x,r), and a  cv2 binary image
# result_path (string): Filepath to the file which the tracked frames will be stored
# video_name (string): Filename of the video to be processed
#
# Takes in a list of frames, draws t he circle onto the image file, and saves the 
# annotated picture to the desired folder
'''
def save_processed(frames, result_path, video_name):

    os.makedirs(result_path, exist_ok=True)

    for frame_idx, frame in enumerate(frames):

        img = frame.get_image().copy()
        circles = frame.get_circles()

        if circles is not None:

            circles = np.array(circles, dtype=np.float32).reshape(-1, 3)

            for circle in circles:

                x, y, r = map(int, circle)
                cv2.circle(img, (x, y), r, (0, 255, 0), 2)
                cv2.circle(img, (x, y), 2, (0, 0, 255), 3)

        final_img_path = os.path.join(result_path, f"{video_name}{frame_idx}.jpg")
        cv2.imwrite(final_img_path, img)

        
'''
# video_path (string): Filepath to the folder containing the video to be processed
# video_name (string): Filename of the video to be processed
# output_path (string): Filepath to the frame storage folder
# return: Returns the frame count of the extracted video
#
# Takes the video found at "video_path/video_name", converts it into a series of jpgs,
# and saves them to the desired folder
'''
def extract_frames(video_path, video_name, output_path):

    os.makedirs(output_path, exist_ok=True)

    video_path_complete = os.path.join(video_path, f"{video_name}.mp4")
    vidcap = cv2.VideoCapture(video_path_complete)

    vidcap.set(cv2.CAP_PROP_POS_FRAMES, 0)

    success, image = vidcap.read()

    count = 0

    while success:

        filename = os.path.join(output_path, f"{video_name}{count}.jpg")
        saved = cv2.imwrite(filename, image)
        print(f"Saved {filename}: {saved}")
        success, image = vidcap.read()

        count = count+1

    vidcap.release()

    return count

'''
# frame_path (string): Filepath to the frame storage folder
# video_name (string): Filename of the video to be processed
# frame_count (integer): Number of frames in the frame storage folder
# alg_sens (integer): Sensitivity of the CHT algorithm
# accum_thresh (integer): 
# min_rad (integer): Minimum detection radius for the CHT algorithm (pixels)
# max_rad (integer): Maximum detection radius for the CHT algorithm (pixels)
# return (frame list): Returns a list of frame objects containing a cv2 binary image
# of a frame, and a np array of circular masks of format (y,x,r)
#
# Takes all frames stored at the frame path, runs them through the CHT algorithm to 
# generate circular masks, packages each frame into a frame object, and compiles all
# frames into an ordered list
'''
def mask_frames(frame_path, video_name, frame_count, alg_sens = 16, accum_thresh = 70, min_rad = 1, max_rad = 10):

    frames = []

    for i in range(0, frame_count):

        img_path = os.path.join(frame_path, f"{video_name}" + str(i) + ".jpg")
        print(img_path)
        img_color = cv2.imread(img_path)

        if img_color is None: raise FileNotFoundError(f"Could not read image at {img_path}")

        img_gray = cv2.cvtColor(img_color, cv2.COLOR_BGR2GRAY)
        img_gray = cv2.GaussianBlur(img_gray, (3, 3), 0)

        circles = cv2.HoughCircles(
            img_gray,
            cv2.HOUGH_GRADIENT,
            dp = 1,
            minDist = 50,
            param1 = accum_thresh,
            param2 = alg_sens,
            minRadius = min_rad,
            maxRadius= max_rad
        )

        frames.append(frame(img_color, circles))

    return frames

'''
def filter_baseballs(frames, rad_sense = 20, overlap_min = 5, overlap_max = 70, colourdiff_min = 50, bright_min = 125):

    print("Filtering for White Masks...")
    pass_1 = filter_white(frames, colourdiff_min, bright_min)

    print("Filtering for Perminance...")
    #pass_2 = filter_overlap(pass_1, overlap_min, overlap_max)

    print("Filtering for Movement...")
    #pass_3 = filter_moving(pass_2, rad_sense)

    return pass_1
'''

'''
# frames (frame list): A sequential list of tracked frames. Each frame object contains
# a np array of circles of the format (y,x,r), and a cv2 binary image
# return (frame list): Returns the original frame list but filtered for only the most 
# likely mask to be a baseball
#
# Takes a list of fully masked frames, and filters them by whiteness and overlap with
# the previous best mask, then only keeps the best match for each frame
'''
def filter_baseballs(frames):
    print("Scoring Mask Whiteness...")

    score_arr = filter_white(frames)

    score_arr = filter_overlap(frames, score_arr)

    score_arr = filter_moving(frames, score_arr)

    for f_idx, f in enumerate(frames):

        new_circles = []

        if len(score_arr[f_idx]) == 0: continue

        best_fit_idx = int(np.argmax(score_arr[f_idx]))
        circles = np.array(f.get_circles(), dtype=np.float32).reshape(-1, 3)

        best_mask = circles[best_fit_idx]
        new_circles.append(best_mask)

        if score_arr[f_idx][best_fit_idx] < 0.87: new_circles = []

        f.set_circles(np.array(new_circles))

        
    return frames

'''
# frames (frame list): A sequential list of tracked frames. Each frame object contains
# a np array of circles of the format (y,x,r), and a cv2 binary image
# weight (float): The weight of the original (0,1) score to be included in the final 
# score array. Weight value of all used filters must sum to 1.0
# return: Returns an a 2D list of scores pertaining to each circular mask in each 
# frame object
'''
def filter_white(frames, weight = 0.20):
    score_arr = []

    for f in frames:

        img = f.get_image()
        circles = f.get_circles()

        if circles is None or len(circles) == 0:

            score_arr.append([])
            continue

        circles = np.array(circles, dtype=np.float32).reshape(-1, 3)
        scores = []

        for c in circles:

            x, y, r = float(c[0]), float(c[1]), float(c[2])

            mask = np.zeros(img.shape[:2], dtype=np.uint8)
            cv2.circle(mask, (int(round(x)), int(round(y))), int(round(r)), 255, -1)

            mean_color = cv2.mean(img, mask=mask)
            b, g, r_col = mean_color[:3]

            channel_diff = int(max(b, g, r_col)) - int(min(b, g, r_col))
            brightness = (int(r_col) + int(g) + int(b)) / 3

            #score = (brightness + (255 - channel_diff)) / 100
            score = (brightness/255) * ((255-channel_diff)/255) * weight
            scores.append(score)

        score_arr.append(scores)

    return score_arr




'''
def filter_white(frames, colourdiff_min, bright_min):

    new_frames = []

    for f in frames:
        img = f.get_image()
        circles = f.get_circles()

        if circles is None:
            f.set_circles(None)
            new_frames.append(f)
            continue

        circles = np.squeeze(circles)

        new_circles = []

        for c in circles:
            x, y, r = float(c[0]), float(c[1]), float(c[2])

            mask = np.zeros(img.shape[:2], dtype=np.uint8)
            cv2.circle(mask, (int(round(x)), int(round(y))), int(round(r)), 255, -1)

            mean_color = cv2.mean(img, mask=mask)
            b, g, r_col = mean_color[:3]

            channel_diff = int(max(b, g, r_col)) - int(min(b, g, r_col))
            brightness = (int(r_col) + int(g) + int(b)) / 3

            if channel_diff <= colourdiff_min and brightness >= bright_min:
                new_circles.append([x, y, r])

        if new_circles:
            f.set_circles(np.array([new_circles], dtype=np.float32))
        else:
            f.set_circles(None)

        new_frames.append(f)

    return new_frames
'''       

'''
# frames (frame list): A sequential list of tracked frames. Each frame object contains
# a np array of circles of the format (y,x,r), and a cv2 binary image
# score_Arr (list): The previous 2D list of scores pertaining to each frame and circle
# belonging to that frame
# weight (float): The weight of the original (0,1) score to be included in the final 
# score array. Weight value of all used filters must sum to 1.0
#
# Assigns a score to each circular mask within a frame based on the distance to the 
# previous highest weighted circular mask
'''
def filter_overlap(frames, score_arr, weight = 0.8):

    # Consider weighing anything outside of 5ish percent of the best mask as 0

    zero_circles = frames[0].get_circles()

    for c_idx, c in enumerate(zero_circles):

        score_arr[0][c_idx] += 1 * weight
        

    for f in range(1, len(frames)):

        current_circles = np.array(frames[f].get_circles()).reshape(-1, 3)
        previous_circles = np.array(frames[f-1].get_circles()).reshape(-1, 3)

        if len(previous_circles) == 0:

            for c_idx, c in enumerate(current_circles):

                 score_arr[f][c_idx] = 1 * weight
                 continue

        if len(previous_circles) == 0 or len(current_circles) == 0: continue

        best_fit_idx = int(np.argmax(score_arr[f-1]))
        prev_best_fit = previous_circles[best_fit_idx]
        x1, y1, _ = prev_best_fit

        height, width = frames[0].get_dimensions()
        max_dist = math.hypot(height, width)

        for c_idx, c in enumerate(current_circles):

            x2, y2, _ = c
            dist = math.hypot(x2 - x1, y2 - y1)

            percent_max = dist/max_dist
            score = (1 - percent_max) * weight

            score_arr[f][c_idx] += score

    return score_arr         


def filter_moving(frames, score_arr, weight = 0, ideal_delta = -2):
    
    for f in range(1, len(frames)):

        current_circles = np.array(frames[f].get_circles()).reshape(-1, 3)
        previous_circles = np.array(frames[f-1].get_circles()).reshape(-1, 3)

        if len(previous_circles) == 0 or len(current_circles) == 0: continue

        best_fit_idx = int(np.argmax(score_arr[f-1]))
        prev_best_fit = previous_circles[best_fit_idx]
        _, _, r = prev_best_fit

        for c_idx,c in enumerate(current_circles):

            delta = c[2] - r
            score = abs(min(ideal_delta,delta)/max(ideal_delta,delta)) * weight

            score_arr[f][c_idx] += score

    return score_arr




run(r"C:\Github\CapstoneGroup3\Ball_Tracking\Videos","test_vid5",r"C:\Github\CapstoneGroup3\Ball_Tracking\Frames",r"C:\Github\CapstoneGroup3\Ball_Tracking\End_Frames")