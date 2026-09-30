import cv2
import os

BASE_PATH = os.path.dirname(os.path.abspath(__file__))

# -----------------------------
# Load Face Recognizer
# -----------------------------
recognizer = cv2.face.LBPHFaceRecognizer_create()

trainer_file = os.path.join(
    BASE_PATH,
    "trainer",
    "trainer.yml"
)

if not os.path.exists(trainer_file):
    print("ERROR: trainer.yml not found.")
    exit()

recognizer.read(trainer_file)

print("Trainer loaded successfully.")

# -----------------------------
# Load Haar Cascade
# -----------------------------
cascade_file = os.path.join(
    BASE_PATH,
    "haarcascade_frontalface_default.xml"
)

face_detector = cv2.CascadeClassifier(cascade_file)

if face_detector.empty():
    print("ERROR: Haar cascade file could not be loaded.")
    exit()

print("Haar cascade loaded successfully.")

# -----------------------------
# Start Camera
# -----------------------------
camera = cv2.VideoCapture(0)

if not camera.isOpened():
    print("ERROR: Camera could not be opened.")
    exit()

print("Camera started.")
print("Look at the camera.")
print("Press ESC to stop.")

while True:

    ret, frame = camera.read()

    if not ret:
        print("Camera se frame nahi mil raha.")
        break

    gray = cv2.cvtColor(
        frame,
        cv2.COLOR_BGR2GRAY
    )

    # Detect faces
    faces = face_detector.detectMultiScale(
        gray,
        scaleFactor=1.1,
        minNeighbors=4,
        minSize=(80, 80)
    )

    # -----------------------------
    # Face Detection Result
    # -----------------------------
    if len(faces) == 0:
        cv2.putText(
            frame,
            "No Face Detected",
            (20, 40),
            cv2.FONT_HERSHEY_SIMPLEX,
            0.8,
            (0, 0, 255),
            2
        )

    else:

        for (x, y, w, h) in faces:

            face_image = gray[
                y:y+h,
                x:x+w
            ]

            # -----------------------------
            # Predict Professional ID
            # -----------------------------
            user_id, confidence = recognizer.predict(
                face_image
            )

            print(
                f"Detected Face -> ID: {user_id}, "
                f"Distance: {confidence:.2f}"
            )

            # LBPH: lower distance = better match
            if confidence < 70:

                text = f"Professional ID: {user_id}"
                color = (0, 255, 0)

            else:

                text = "Unknown Face"
                color = (0, 0, 255)

            # Face rectangle
            cv2.rectangle(
                frame,
                (x, y),
                (x+w, y+h),
                color,
                2
            )

            # ID
            cv2.putText(
                frame,
                text,
                (x, y - 10),
                cv2.FONT_HERSHEY_SIMPLEX,
                0.8,
                color,
                2
            )

            # Distance
            cv2.putText(
                frame,
                f"Distance: {confidence:.2f}",
                (x, y+h+25),
                cv2.FONT_HERSHEY_SIMPLEX,
                0.6,
                color,
                2
            )

    # Show camera
    cv2.imshow(
        "Face Recognition",
        frame
    )

    key = cv2.waitKey(1) & 0xFF

    if key == 27:
        break

camera.release()
cv2.destroyAllWindows()

print("Face recognition stopped.")