import cv2
import os

BASE_PATH = os.path.dirname(os.path.abspath(__file__))

user_id = input("Enter Professional ID: ")

folder = os.path.join(
    BASE_PATH,
    "dataset",
    f"User.{user_id}"
)

os.makedirs(folder, exist_ok=True)

print("Saving faces to:")
print(folder)

camera = cv2.VideoCapture(0)

face_detector = cv2.CascadeClassifier(
    os.path.join(
        BASE_PATH,
        "haarcascade_frontalface_default.xml"
    )
)

if face_detector.empty():
    print("ERROR: Haar cascade file not loaded.")
    camera.release()
    exit()

count = 0

print("Camera started.")
print("Look at the camera.")
print("Press ESC to stop.")

while True:

    ret, frame = camera.read()

    if not ret:
        print("Camera se frame nahi mil raha.")
        break

    gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)

    faces = face_detector.detectMultiScale(
        gray,
        scaleFactor=1.3,
        minNeighbors=5
    )

    for (x, y, w, h) in faces:

        if count >= 30:
            break

        count += 1

        face_image = gray[y:y+h, x:x+w]

        file_path = os.path.join(
            folder,
            f"User.{user_id}.{count}.jpg"
        )

        saved = cv2.imwrite(file_path, face_image)

        if saved:
            print(f"Saved: {file_path}")
        else:
            print(f"FAILED TO SAVE: {file_path}")

        cv2.rectangle(
            frame,
            (x, y),
            (x+w, y+h),
            (255, 0, 0),
            2
        )

        cv2.putText(
            frame,
            f"Samples: {count}/30",
            (x, y - 10),
            cv2.FONT_HERSHEY_SIMPLEX,
            0.8,
            (255, 255, 255),
            2
        )

    cv2.imshow("Face Registration", frame)

    key = cv2.waitKey(100) & 0xFF

    if key == 27:
        break

    if count >= 30:
        break

camera.release()
cv2.destroyAllWindows()

print(f"Face registration completed. Samples: {count}")
print(f"Dataset folder: {folder}")