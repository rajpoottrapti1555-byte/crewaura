import cv2

camera = cv2.VideoCapture(0)

if not camera.isOpened():
    print("Camera open nahi ho raha.")
    exit()

print("Camera started. ESC press karke close karo.")

while True:
    ret, frame = camera.read()

    if not ret:
        print("Camera se frame nahi mil raha.")
        break

    cv2.imshow("CrewAura Camera Test", frame)

    if cv2.waitKey(1) & 0xFF == 27:
        break

camera.release()
cv2.destroyAllWindows()