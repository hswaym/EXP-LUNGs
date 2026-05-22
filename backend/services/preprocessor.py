import cv2
import numpy as np
from PIL import Image

def preprocess_image(image_path: str) -> np.ndarray:
    """
    Load image, apply CLAHE contrast enhancement, and Gaussian denoise.
    Returns RGB numpy array suitable for ML.
    """
    img = cv2.imread(image_path, cv2.IMREAD_GRAYSCALE)
    
    if img is None:
        raise ValueError(f"Could not load image at {image_path}")
        
    # Contrast Limited Adaptive Histogram Equalization
    clahe = cv2.createCLAHE(clipLimit=2.0, tileGridSize=(8, 8))
    enhanced = clahe.apply(img)
    
    # Gaussian Denoising
    denoised = cv2.GaussianBlur(enhanced, (5, 5), 0)
    
    # Convert back to RGB for Resnet
    rgb_img = cv2.cvtColor(denoised, cv2.COLOR_GRAY2RGB)
    
    return rgb_img
