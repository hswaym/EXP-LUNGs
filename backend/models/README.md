# How to Integrate Your Colab-Trained Model

Follow these steps to integrate your custom model into the ExpLung-U Neural Engine.

### 1. Export from Google Colab

#### Case A: Classification (DenseNet121)
```python
# Save as custom_classifier.pth
torch.save(model.state_dict(), 'custom_classifier.pth')
```

#### Case B: Segmentation (U-Net)
```python
# Save as custom_segmenter.pth
torch.save(model.state_dict(), 'custom_segmenter.pth')
```

### 2. Prepare the Project
1. Download the `.pth` files.
2. Move them to `backend/models/`.
   - Classification weights -> `custom_classifier.pth`
   - Segmentation weights -> `custom_segmenter.pth`

### 3. Verification
Restart the backend. You should see:
`[classifier] Loading CUSTOM weights...`
`[segmenter] Loading CUSTOM U-Net weights...`

### Note on Architecture
Our current engine uses **DenseNet121** (the backbone of CheXNet). Ensure your model in Colab is also initialized as `models.densenet121()` for the weights to match perfectly.

---

## Future Scaling: NIH Dataset
The NIH Chest X-ray dataset contains 14 clinical labels. Our current UI supports the primary 5:
- Normal
- Pneumonia
- COVID-19
- Tuberculosis
- Lung Opacity

When training on NIH, ensure your final fully connected layer maps to these classes or similar clinical proxies.
