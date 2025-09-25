#!/usr/bin/env python3
"""
AI Medical Surveillance Camera System
Human Motion Detection and Tracking

This system detects and tracks human movements for medical surveillance,
specifically designed for clinics to monitor patient tasks and compliance.
"""

import cv2
import mediapipe as mp
import numpy as np
from datetime import datetime


class HumanMotionDetector:
    def __init__(self, motion_threshold: float = 30.0, processing_scale: float = 0.6):
        """Initialize the motion detection system."""
        # Clamp processing scale to avoid invalid resize factors
        self.processing_scale = min(max(processing_scale, 0.2), 1.0)

        # Initialize MediaPipe modules with lighter configurations for speed
        self.mp_pose = mp.solutions.pose
        self.mp_hands = mp.solutions.hands
        self.mp_face_detection = mp.solutions.face_detection
        self.mp_drawing = mp.solutions.drawing_utils
        self.mp_drawing_styles = mp.solutions.drawing_styles

        self.pose = self.mp_pose.Pose(
            static_image_mode=False,
            model_complexity=0,
            enable_segmentation=False,
            smooth_landmarks=True,
            min_detection_confidence=0.5,
            min_tracking_confidence=0.5,
        )

        self.hands = self.mp_hands.Hands(
            static_image_mode=False,
            max_num_hands=1,
            min_detection_confidence=0.6,
            min_tracking_confidence=0.5,
        )

        self.face_detection = self.mp_face_detection.FaceDetection(
            model_selection=0,
            min_detection_confidence=0.6,
        )

        # Motion tracking variables
        self.motion_threshold = motion_threshold
        self.person_detected = False
        self.motion_detected = False
        self.previous_landmarks = None
        self.frame_count = 0

    def calculate_motion_intensity(self, current_landmarks, previous_landmarks) -> float:
        """Calculate motion intensity between current and previous pose landmarks."""
        if previous_landmarks is None:
            return 0.0

        motion_sum = 0.0
        landmark_count = 0

        for curr_landmark, prev_landmark in zip(current_landmarks, previous_landmarks):
            if curr_landmark.visibility > 0.5 and prev_landmark.visibility > 0.5:
                distance = np.sqrt(
                    (curr_landmark.x - prev_landmark.x) ** 2
                    + (curr_landmark.y - prev_landmark.y) ** 2
                )
                motion_sum += distance
                landmark_count += 1

        return (motion_sum / landmark_count * 100) if landmark_count else 0.0

    def process_frame(self, frame):
        """Process a single frame for human detection and motion analysis."""
        self.frame_count += 1

        if self.processing_scale < 1.0:
            processing_frame = cv2.resize(
                frame,
                (0, 0),
                fx=self.processing_scale,
                fy=self.processing_scale,
                interpolation=cv2.INTER_AREA,
            )
        else:
            processing_frame = frame

        rgb_frame = cv2.cvtColor(processing_frame, cv2.COLOR_BGR2RGB)

        # Run MediaPipe detectors on the downscaled frame for faster processing
        pose_results = self.pose.process(rgb_frame)
        hand_results = self.hands.process(rgb_frame)
        face_results = self.face_detection.process(rgb_frame)

        person_in_frame = False
        motion_intensity = 0.0

        if face_results.detections:
            person_in_frame = True
            for detection in face_results.detections:
                self.mp_drawing.draw_detection(frame, detection)

        if pose_results.pose_landmarks:
            person_in_frame = True
            self.mp_drawing.draw_landmarks(
                frame,
                pose_results.pose_landmarks,
                self.mp_pose.POSE_CONNECTIONS,
                landmark_drawing_spec=self.mp_drawing_styles.get_default_pose_landmarks_style(),
            )

            current_landmarks = pose_results.pose_landmarks.landmark
            motion_intensity = self.calculate_motion_intensity(
                current_landmarks, self.previous_landmarks
            )
            self.previous_landmarks = current_landmarks
            self.motion_detected = motion_intensity > self.motion_threshold
        else:
            self.motion_detected = False
            self.previous_landmarks = None

        if hand_results.multi_hand_landmarks:
            for hand_landmarks in hand_results.multi_hand_landmarks:
                self.mp_drawing.draw_landmarks(
                    frame,
                    hand_landmarks,
                    self.mp_hands.HAND_CONNECTIONS,
                    self.mp_drawing_styles.get_default_hand_landmarks_style(),
                    self.mp_drawing_styles.get_default_hand_connections_style(),
                )

        self.person_detected = person_in_frame
        self.add_info_overlay(frame, motion_intensity, person_in_frame)

        return frame

    def add_info_overlay(self, frame, motion_intensity: float, person_detected: bool):
        """Add information overlay to the frame."""
        status_color = (0, 255, 0) if person_detected else (0, 0, 255)
        cv2.putText(
            frame,
            f"Person: {'Detected' if person_detected else 'Not Detected'}",
            (10, 30),
            cv2.FONT_HERSHEY_SIMPLEX,
            0.7,
            status_color,
            2,
        )

        cv2.putText(
            frame,
            f"Motion Intensity: {motion_intensity:.2f}",
            (10, 60),
            cv2.FONT_HERSHEY_SIMPLEX,
            0.6,
            (255, 255, 255),
            2,
        )

        if self.processing_scale < 1.0:
            cv2.putText(
                frame,
                f"Processing Scale: {self.processing_scale:.2f}",
                (10, 90),
                cv2.FONT_HERSHEY_SIMPLEX,
                0.5,
                (200, 200, 200),
                1,
            )

        current_time = datetime.now().strftime("%H:%M:%S")
        cv2.putText(
            frame,
            f"Time: {current_time}",
            (10, frame.shape[0] - 20),
            cv2.FONT_HERSHEY_SIMPLEX,
            0.6,
            (255, 255, 255),
            2,
        )


def main():
    """Main function to run the camera surveillance system."""
    print("Starting AI Medical Surveillance Camera System...")
    print("Press 'q' to quit")

    detector = HumanMotionDetector()

    print("Trying to open camera with DirectShow backend...")
    cap = cv2.VideoCapture(0, cv2.CAP_DSHOW)

    if not cap.isOpened():
        print("Error: Could not open camera index 0")
        print("Trying camera index 1...")
        cap = cv2.VideoCapture(1, cv2.CAP_DSHOW)
        if not cap.isOpened():
            print("Error: Could not open any camera")
            return

    print("Camera opened successfully!")

    # Request lighter capture settings; some cameras will clamp to supported values.
    cap.set(cv2.CAP_PROP_FRAME_WIDTH, 960)
    cap.set(cv2.CAP_PROP_FRAME_HEIGHT, 540)
    cap.set(cv2.CAP_PROP_FPS, 24)
    cap.set(cv2.CAP_PROP_BUFFERSIZE, 1)
    cap.set(cv2.CAP_PROP_FOURCC, cv2.VideoWriter_fourcc(*"MJPG"))

    actual_width = int(cap.get(cv2.CAP_PROP_FRAME_WIDTH))
    actual_height = int(cap.get(cv2.CAP_PROP_FRAME_HEIGHT))
    actual_fps = cap.get(cv2.CAP_PROP_FPS) or 0
    print(f"Camera configured to {actual_width}x{actual_height} @ {actual_fps:.0f} FPS")

    try:
        while True:
            ret, frame = cap.read()
            if not ret:
                print("Error: Could not read frame from camera")
                print("This might be a camera permission issue or no camera available")
                break

            processed_frame = detector.process_frame(frame)
            cv2.imshow('AI Medical Surveillance System', processed_frame)

            if cv2.waitKey(1) & 0xFF == ord('q'):
                break

    except KeyboardInterrupt:
        print("\nShutting down...")
    finally:
        cap.release()
        cv2.destroyAllWindows()
        print("AI Medical Surveillance System stopped.")


if __name__ == "__main__":
    main()
