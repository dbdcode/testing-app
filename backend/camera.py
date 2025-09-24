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
    def __init__(self):
        """Initialize the motion detection system."""
        # Initialize MediaPipe
        self.mp_pose = mp.solutions.pose
        self.mp_hands = mp.solutions.hands
        self.mp_face_detection = mp.solutions.face_detection
        self.mp_drawing = mp.solutions.drawing_utils
        self.mp_drawing_styles = mp.solutions.drawing_styles
        
        # Initialize pose detection
        self.pose = self.mp_pose.Pose(
            static_image_mode=False,
            model_complexity=1,
            enable_segmentation=True,
            min_detection_confidence=0.7,
            min_tracking_confidence=0.5
        )
        
        # Initialize hand detection
        self.hands = self.mp_hands.Hands(
            static_image_mode=False,
            max_num_hands=2,
            min_detection_confidence=0.7,
            min_tracking_confidence=0.5
        )
        
        # Initialize face detection
        self.face_detection = self.mp_face_detection.FaceDetection(
            model_selection=0,
            min_detection_confidence=0.7
        )
        
        # Motion tracking variables
        self.motion_threshold = 30
        self.person_detected = False
        self.motion_detected = False
        self.previous_landmarks = None
        
    def calculate_motion_intensity(self, current_landmarks, previous_landmarks):
        """Calculate motion intensity between current and previous pose landmarks."""
        if previous_landmarks is None:
            return 0
        
        motion_sum = 0
        landmark_count = 0
        
        for i, (curr_landmark, prev_landmark) in enumerate(zip(current_landmarks, previous_landmarks)):
            if curr_landmark.visibility > 0.5 and prev_landmark.visibility > 0.5:
                # Calculate distance between current and previous landmark positions
                distance = np.sqrt(
                    (curr_landmark.x - prev_landmark.x) ** 2 +
                    (curr_landmark.y - prev_landmark.y) ** 2
                )
                motion_sum += distance
                landmark_count += 1
        
        return (motion_sum / landmark_count * 100) if landmark_count > 0 else 0
    
    def process_frame(self, frame):
        """Process a single frame for human detection and motion analysis."""
        # Convert BGR to RGB
        rgb_frame = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
        
        # Process pose detection
        pose_results = self.pose.process(rgb_frame)
        hand_results = self.hands.process(rgb_frame)
        face_results = self.face_detection.process(rgb_frame)
        
        # Initialize detection flags
        person_in_frame = False
        motion_intensity = 0
        
        # Draw face detection
        if face_results.detections:
            person_in_frame = True
            for detection in face_results.detections:
                self.mp_drawing.draw_detection(frame, detection)
        
        # Process pose landmarks
        if pose_results.pose_landmarks:
            person_in_frame = True
            
            # Draw pose landmarks
            self.mp_drawing.draw_landmarks(
                frame,
                pose_results.pose_landmarks,
                self.mp_pose.POSE_CONNECTIONS,
                landmark_drawing_spec=self.mp_drawing_styles.get_default_pose_landmarks_style()
            )
            
            # Calculate motion intensity
            current_landmarks = pose_results.pose_landmarks.landmark
            motion_intensity = self.calculate_motion_intensity(current_landmarks, self.previous_landmarks)
            self.previous_landmarks = current_landmarks
            
            # Update motion detection
            if motion_intensity > self.motion_threshold:
                self.motion_detected = True
            else:
                self.motion_detected = False
        
        # Draw hand landmarks
        if hand_results.multi_hand_landmarks:
            for hand_landmarks in hand_results.multi_hand_landmarks:
                self.mp_drawing.draw_landmarks(
                    frame,
                    hand_landmarks,
                    self.mp_hands.HAND_CONNECTIONS,
                    self.mp_drawing_styles.get_default_hand_landmarks_style(),
                    self.mp_drawing_styles.get_default_hand_connections_style()
                )
        
        # Update person detection status
        self.person_detected = person_in_frame
        
        # Add information overlay
        self.add_info_overlay(frame, motion_intensity, person_in_frame)
        
        return frame
    
    def add_info_overlay(self, frame, motion_intensity, person_detected):
        """Add information overlay to the frame."""
        # Add status information
        status_color = (0, 255, 0) if person_detected else (0, 0, 255)
        cv2.putText(frame, f"Person: {'Detected' if person_detected else 'Not Detected'}", 
                   (10, 30), cv2.FONT_HERSHEY_SIMPLEX, 0.7, status_color, 2)
        
        cv2.putText(frame, f"Motion Intensity: {motion_intensity:.2f}", 
                   (10, 60), cv2.FONT_HERSHEY_SIMPLEX, 0.6, (255, 255, 255), 2)
        
        # Show current time
        current_time = datetime.now().strftime("%H:%M:%S")
        cv2.putText(frame, f"Time: {current_time}", 
                   (10, frame.shape[0] - 20), cv2.FONT_HERSHEY_SIMPLEX, 0.6, (255, 255, 255), 2)


def main():
    """Main function to run the camera surveillance system."""
    print("Starting AI Medical Surveillance Camera System...")
    print("Press 'q' to quit")
    
    # Initialize motion detector
    detector = HumanMotionDetector()
    
    # Initialize camera
    print("Trying to open camera...")
    cap = cv2.VideoCapture(0)  # Use default camera
    
    if not cap.isOpened():
        print("Error: Could not open camera index 0")
        print("Trying camera index 1...")
        cap = cv2.VideoCapture(1)
        if not cap.isOpened():
            print("Error: Could not open any camera")
            return
    
    print("Camera opened successfully!")
    
    # Set camera properties
    cap.set(cv2.CAP_PROP_FRAME_WIDTH, 1280)
    cap.set(cv2.CAP_PROP_FRAME_HEIGHT, 720)
    cap.set(cv2.CAP_PROP_FPS, 30)
    
    try:
        while True:
            # Read frame from camera
            ret, frame = cap.read()
            if not ret:
                print("Error: Could not read frame from camera")
                print("This might be a camera permission issue or no camera available")
                break
            
            # Process frame
            processed_frame = detector.process_frame(frame)
            
            # Display the frame
            cv2.imshow('AI Medical Surveillance System', processed_frame)
            
            # Handle key presses
            key = cv2.waitKey(1) & 0xFF
            if key == ord('q'):
                break
    
    except KeyboardInterrupt:
        print("\nShutting down...")
    
    finally:
        # Cleanup
        cap.release()
        cv2.destroyAllWindows()
        print("AI Medical Surveillance System stopped.")

if __name__ == "__main__":
    main()
