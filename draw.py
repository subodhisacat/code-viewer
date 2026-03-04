import tkinter as tk
from tkinter import filedialog
from PIL import Image, ImageTk
import cv2
import pyautogui
import threading
import time

class SketchDrawer:
    def __init__(self, root):
        self.root = root
        self.root.title("Sketch Drawer - Windows 11 Fixed")

        self.image = None
        self.sketch = None

        self.start_x = None
        self.start_y = None
        self.end_x = None
        self.end_y = None

        self.label = tk.Label(root)
        self.label.pack()

        tk.Button(root, text="Upload Image", command=self.upload_image).pack(pady=5)
        tk.Button(root, text="Select Area", command=self.select_area).pack(pady=5)
        tk.Button(root, text="Draw", command=self.start_thread).pack(pady=5)

        pyautogui.PAUSE = 0.001
        pyautogui.FAILSAFE = True

    # ---------------- IMAGE ----------------
    def upload_image(self):
        file_path = filedialog.askopenfilename()
        if not file_path:
            return

        self.image = cv2.imread(file_path)
        gray = cv2.cvtColor(self.image, cv2.COLOR_BGR2GRAY)

        edges = cv2.Canny(gray, 80, 150)
        self.sketch = edges

        preview = cv2.resize(edges, (400, 400))
        img = Image.fromarray(preview)
        img_tk = ImageTk.PhotoImage(img)

        self.label.config(image=img_tk)
        self.label.image = img_tk

    # ---------------- AREA SELECTION ----------------
    def select_area(self):
        self.overlay = tk.Toplevel(self.root)
        self.overlay.attributes("-fullscreen", True)
        self.overlay.attributes("-alpha", 0.3)
        self.overlay.configure(bg="black")

        self.canvas = tk.Canvas(self.overlay, cursor="cross")
        self.canvas.pack(fill=tk.BOTH, expand=True)

        self.canvas.bind("<ButtonPress-1>", self.on_press)
        self.canvas.bind("<B1-Motion>", self.on_drag)
        self.canvas.bind("<ButtonRelease-1>", self.on_release)

    def on_press(self, event):
        self.start_x = event.x_root
        self.start_y = event.y_root
        self.rect = self.canvas.create_rectangle(
            event.x, event.y, event.x, event.y,
            outline="red", width=2
        )

    def on_drag(self, event):
        self.canvas.coords(self.rect,
                           self.canvas.coords(self.rect)[0],
                           self.canvas.coords(self.rect)[1],
                           event.x, event.y)

    def on_release(self, event):
        self.end_x = event.x_root
        self.end_y = event.y_root
        self.overlay.destroy()
        print("Area selected:",
              self.start_x, self.start_y,
              self.end_x, self.end_y)

    # ---------------- DRAW ----------------
    def start_thread(self):
        threading.Thread(target=self.draw).start()

    def draw(self):
        if self.sketch is None:
            print("Upload image first!")
            return

        if None in (self.start_x, self.start_y, self.end_x, self.end_y):
            print("Select area first!")
            return

        start_x = min(self.start_x, self.end_x)
        start_y = min(self.start_y, self.end_y)
        width = abs(self.end_x - self.start_x)
        height = abs(self.end_y - self.start_y)

        resized = cv2.resize(self.sketch, (width, height))

        print("Click inside Paint now... Drawing starts in 3 seconds")
        time.sleep(3)

        step = 1  # keep 1 for accuracy

        for y in range(0, height, step):
            for x in range(0, width, step):
                if resized[y, x] > 0:
                    pyautogui.moveTo(start_x + x, start_y + y)
                    pyautogui.click()

        print("Done!")

root = tk.Tk()
app = SketchDrawer(root)
root.mainloop()