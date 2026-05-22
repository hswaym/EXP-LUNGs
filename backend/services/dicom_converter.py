import os
import numpy as np
from PIL import Image

def convert_dicom_to_png(dicom_path: str, output_path: str) -> str:
    """
    Converts a DICOM file to a PNG image suitable for ResNet inference.
    Returns the path to the saved PNG.
    """
    import pydicom

    ds = pydicom.dcmread(dicom_path)
    pixel_array = ds.pixel_array.astype(float)

    # Normalize to 0-255
    pixel_min = pixel_array.min()
    pixel_max = pixel_array.max()
    if pixel_max > pixel_min:
        pixel_array = (pixel_array - pixel_min) / (pixel_max - pixel_min) * 255
    else:
        pixel_array = np.zeros_like(pixel_array)

    pixel_array = pixel_array.astype(np.uint8)

    # Handle multi-frame DICOM (take the middle frame)
    if pixel_array.ndim == 3 and pixel_array.shape[0] > 1:
        mid = pixel_array.shape[0] // 2
        pixel_array = pixel_array[mid]

    # Convert to grayscale PIL Image then save
    pil_image = Image.fromarray(pixel_array)
    if pil_image.mode != "L":
        pil_image = pil_image.convert("L")

    # Save as PNG
    pil_image.save(output_path, format="PNG")
    return output_path

def is_dicom(filename: str) -> bool:
    """Check if a file is a DICOM based on its extension."""
    return filename.lower().endswith(".dcm")
