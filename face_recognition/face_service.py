from flask import Flask, jsonify
from flask_cors import CORS
import cv2
import os

app = Flask(__name__)
CORS(app)

BASE_PATH = os.path.dirname(os.path.abspath(__file__))

TRAINER_FILE = os.path.join(
    BASE_PATH,
    "trainer",
    "trainer.yml"
)

CASCADE_FILE = os.path.join(
    BASE_PATH,
    "haarcascade_frontalface_default.xml"
)

DATASET_PATH = os.path.join(
    BASE_PATH,
    "dataset"
)

face_detector = cv2.CascadeClassifier(CASCADE_FILE)


# =========================================================
# REGISTER FACE
# =========================================================

@app.route("/register-face/<int:professional_id>", methods=["GET"])
def register_face(professional_id):

    folder = os.path.join(
        DATASET_PATH,
        f"User.{professional_id}"
    )

    os.makedirs(folder, exist_ok=True)

    camera = cv2.VideoCapture(0)

    if not camera.isOpened():
        return jsonify({
            "success": False,
            "message": "Camera could not be opened."
        }), 500

    print(
        f"Face registration started for Professional ID: "
        f"{professional_id}"
    )

    count = 0

    while True:

        ret, frame = camera.read()

        if not ret:
            continue

        gray = cv2.cvtColor(
            frame,
            cv2.COLOR_BGR2GRAY
        )

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
                f"User.{professional_id}.{count}.jpg"
            )

            saved = cv2.imwrite(
                file_path,
                face_image
            )

            if saved:
                print(
                    f"Saved sample {count}/30: "
                    f"{file_path}"
                )

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

        cv2.imshow(
            "Face Registration",
            frame
        )

        key = cv2.waitKey(100) & 0xFF

        # ESC pressed
        if key == 27:
            break

        # 30 samples completed
        if count >= 30:
            break

    camera.release()
    cv2.destroyAllWindows()

    if count < 30:

        return jsonify({
            "success": False,
            "message": f"Registration stopped. Only {count}/30 samples saved.",
            "samples": count
        }), 400

    # =====================================================
    # TRAIN FACE RECOGNIZER
    # =====================================================

    print("Training face recognizer...")

    recognizer = cv2.face.LBPHFaceRecognizer_create()

    face_samples = []
    ids = []

    for user_folder in os.listdir(DATASET_PATH):

        user_folder_path = os.path.join(
            DATASET_PATH,
            user_folder
        )

        if not os.path.isdir(user_folder_path):
            continue

        if not user_folder.startswith("User."):
            continue

        try:
            user_id = int(
                user_folder.split(".")[1]
            )
        except ValueError:
            continue

        for filename in os.listdir(
            user_folder_path
        ):

            if not filename.lower().endswith(".jpg"):
                continue

            image_path = os.path.join(
                user_folder_path,
                filename
            )

            image = cv2.imread(
                image_path,
                cv2.IMREAD_GRAYSCALE
            )

            if image is None:
                continue

            face_samples.append(image)
            ids.append(user_id)

    if len(face_samples) == 0:

        return jsonify({
            "success": False,
            "message": "No face images found for training."
        }), 500

    os.makedirs(
        os.path.dirname(TRAINER_FILE),
        exist_ok=True
    )

    recognizer.train(
        face_samples,
        __import__("numpy").array(ids)
    )

    recognizer.write(
        TRAINER_FILE
    )

    print(
        f"Training completed. "
        f"Total faces: {len(face_samples)}"
    )

    return jsonify({
        "success": True,
        "professional_id": professional_id,
        "samples": count,
        "message": "Face registered and trained successfully."
    })


# =========================================================
# VERIFY FACE
# =========================================================

@app.route(
    "/verify-face/<int:expected_id>",
    methods=["GET"]
)
def verify_face(expected_id):

    # Trainer file check
    if not os.path.exists(TRAINER_FILE):

        return jsonify({
            "verified": False,
            "message": "Trainer file not found."
        }), 500

    recognizer = cv2.face.LBPHFaceRecognizer_create()

    recognizer.read(
        TRAINER_FILE
    )

    camera = cv2.VideoCapture(0)

    if not camera.isOpened():

        return jsonify({
            "verified": False,
            "message": "Camera could not be opened"
        }), 500

    print(
        f"Face verification started for Professional ID: "
        f"{expected_id}"
    )

    for _ in range(300):

        ret, frame = camera.read()

        if not ret:
            continue

        gray = cv2.cvtColor(
            frame,
            cv2.COLOR_BGR2GRAY
        )

        faces = face_detector.detectMultiScale(
            gray,
            scaleFactor=1.3,
            minNeighbors=5
        )

        for (x, y, w, h) in faces:

            user_id, confidence = recognizer.predict(
                gray[y:y+h, x:x+w]
            )

            print(
                f"Detected ID: {user_id}, "
                f"Confidence distance: {confidence:.2f}"
            )

            if (
                user_id == expected_id
                and confidence < 70
            ):

                cv2.rectangle(
                    frame,
                    (x, y),
                    (x+w, y+h),
                    (0, 255, 0),
                    2
                )

                cv2.putText(
                    frame,
                    "FACE VERIFIED",
                    (x, y - 10),
                    cv2.FONT_HERSHEY_SIMPLEX,
                    0.8,
                    (0, 255, 0),
                    2
                )

                cv2.imshow(
                    "Attendance Face Verification",
                    frame
                )

                cv2.waitKey(1000)

                camera.release()
                cv2.destroyAllWindows()

                return jsonify({
                    "verified": True,
                    "professional_id": user_id,
                    "message": "Face verified successfully"
                })

            else:

                cv2.rectangle(
                    frame,
                    (x, y),
                    (x+w, y+h),
                    (0, 0, 255),
                    2
                )

                cv2.putText(
                    frame,
                    "FACE NOT MATCHED",
                    (x, y - 10),
                    cv2.FONT_HERSHEY_SIMPLEX,
                    0.8,
                    (0, 0, 255),
                    2
                )

        cv2.imshow(
            "Attendance Face Verification",
            frame
        )

        key = cv2.waitKey(1) & 0xFF

        if key == 27:
            break

    camera.release()
    cv2.destroyAllWindows()

    return jsonify({
        "verified": False,
        "message": "Face verification failed"
    })


# =========================================================
# HOME
# =========================================================

@app.route("/")
def home():

    return "Face Recognition Service Running"


# =========================================================
# START SERVER
# =========================================================

if __name__ == "__main__":

    print(
        "Face Recognition Service running on "
        "http://localhost:5001"
    )

    app.run(
        host="127.0.0.1",
        port=5001,
        debug=False
    )