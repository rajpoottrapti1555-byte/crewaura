import cv2
import os
import numpy as np

BASE_PATH = os.path.dirname(os.path.abspath(__file__))

dataset_path = os.path.join(
    BASE_PATH,
    "dataset"
)

trainer_path = os.path.join(
    BASE_PATH,
    "trainer"
)

trainer_file = os.path.join(
    trainer_path,
    "trainer.yml"
)

recognizer = cv2.face.LBPHFaceRecognizer_create()

face_samples = []
ids = []

print("Training faces...")

for user_folder in os.listdir(dataset_path):

    user_folder_path = os.path.join(
        dataset_path,
        user_folder
    )

    if not os.path.isdir(user_folder_path):
        continue

    # User.1 -> 1
    if not user_folder.startswith("User."):
        continue

    try:
        user_id = int(user_folder.split(".")[1])
    except ValueError:
        continue

    print(f"Loading faces for Professional ID: {user_id}")

    for filename in os.listdir(user_folder_path):

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
            print(f"Could not read: {image_path}")
            continue

        # Images already contain cropped faces.
        # So we DON'T detect faces again.

        face_samples.append(image)
        ids.append(user_id)

        print(f"Loaded: {filename}")

print(f"Total face images found: {len(face_samples)}")

if len(face_samples) == 0:
    print("ERROR: No face images found in dataset.")
    exit()

os.makedirs(
    trainer_path,
    exist_ok=True
)

recognizer.train(
    face_samples,
    np.array(ids)
)

recognizer.write(
    trainer_file
)

print()
print("Training completed successfully.")
print(f"Total faces trained: {len(face_samples)}")
print(f"Trainer saved at: {trainer_file}")