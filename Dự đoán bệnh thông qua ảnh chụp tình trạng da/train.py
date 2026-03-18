import pandas as pd
import numpy as np
import os

from sklearn.model_selection import train_test_split
from sklearn.preprocessing import LabelEncoder
from sklearn.utils.class_weight import compute_class_weight

import tensorflow as tf
from tensorflow.keras.preprocessing.image import ImageDataGenerator
from tensorflow.keras.applications import MobileNetV2
from tensorflow.keras import layers, models

# ===============================
# 1. LOAD DATASET
# ===============================

data_dir = "dataset1"

df = pd.read_csv(os.path.join(data_dir,"HAM10000_metadata.csv"))

print(df.head())
print(df["dx"].value_counts())


# ===============================
# 2. IMAGE PATH
# ===============================

image_dir1 = os.path.join(data_dir,"HAM10000_images_part_1")
image_dir2 = os.path.join(data_dir,"HAM10000_images_part_2")

image_paths = []

for img_id in df["image_id"]:
    
    path1 = os.path.join(image_dir1,img_id+".jpg")
    path2 = os.path.join(image_dir2,img_id+".jpg")
    
    if os.path.exists(path1):
        image_paths.append(path1)
    else:
        image_paths.append(path2)

df["path"] = image_paths


# ===============================
# 3. LABEL ENCODING
# ===============================

le = LabelEncoder()

df["label"] = le.fit_transform(df["dx"])


# ===============================
# 4. TRAIN TEST SPLIT
# ===============================

train_df, test_df = train_test_split(

    df,
    test_size=0.2,
    stratify=df["label"],
    random_state=42
)


# ===============================
# 5. DATA AUGMENTATION
# ===============================

train_datagen = ImageDataGenerator(

    rescale=1./255,

    rotation_range=20,

    width_shift_range=0.1,

    height_shift_range=0.1,

    zoom_range=0.2,

    shear_range=0.1,

    horizontal_flip=True,

    vertical_flip=True
)

test_datagen = ImageDataGenerator(rescale=1./255)


# ===============================
# 6. DATA GENERATOR
# ===============================

train_generator = train_datagen.flow_from_dataframe(

    train_df,

    x_col="path",

    y_col="dx",

    target_size=(224,224),

    batch_size=64,

    class_mode="categorical"
)

test_generator = test_datagen.flow_from_dataframe(

    test_df,

    x_col="path",

    y_col="dx",

    target_size=(224,224),

    batch_size=64,

    class_mode="categorical"
)


# ===============================
# 7. CLASS WEIGHT
# ===============================

class_weights = compute_class_weight(

    class_weight="balanced",

    classes=np.unique(train_df["label"]),

    y=train_df["label"]
)

class_weights = dict(enumerate(class_weights))

print("Class weights:",class_weights)


# ===============================
# 8. MODEL
# ===============================

base_model = MobileNetV2(

    input_shape=(224,224,3),

    include_top=False,

    weights="imagenet"
)

base_model.trainable = False


model = models.Sequential([

    base_model,

    layers.GlobalAveragePooling2D(),

    layers.Dense(128,activation="relu"),

    layers.Dropout(0.3),

    layers.Dense(7,activation="softmax")
])


# ===============================
# 9. COMPILE
# ===============================

model.compile(

    optimizer="adam",

    loss="categorical_crossentropy",

    metrics=["accuracy"]
)


# ===============================
# 10. TRAIN
# ===============================

# ===============================
# 10. TRAIN (Stage 1)
# ===============================

print("Stage 1: Training top layers")

history1 = model.fit(

    train_generator,

    validation_data=test_generator,

    epochs=5,

    class_weight=class_weights
)


# ===============================
# 11. FINE TUNING
# ===============================

print("Stage 2: Fine tuning MobileNet")

base_model.trainable = True

# chỉ train 20 layer cuối
for layer in base_model.layers[:-20]:
    layer.trainable = False


model.compile(

    optimizer=tf.keras.optimizers.Adam(learning_rate=1e-5),

    loss="categorical_crossentropy",

    metrics=["accuracy"]
)

history2 = model.fit(

    train_generator,

    validation_data=test_generator,

    epochs=5,

    class_weight=class_weights
)


# ===============================
# 11. SAVE MODEL
# ===============================

trained_model_path = os.path.join(os.path.dirname(__file__), "skin_cancer_model.h5")
model.save(trained_model_path)
print("Saved model:", trained_model_path)


# ===============================
# 12. EVALUATE
# ===============================

loss, acc = model.evaluate(test_generator)

print("Accuracy:",acc)
print("Loss:",loss)