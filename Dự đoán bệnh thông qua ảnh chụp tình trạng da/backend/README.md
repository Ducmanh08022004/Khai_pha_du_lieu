# Skin Disease Backend (Node.js + Express)

Backend nay cung cap API de du doan benh da, nhung KHONG goi truc tiep Python trong Node request flow.
Node backend se goi sang mot Python inference API doc lap qua HTTP.

## 1) Kien truc

- Node backend: nhan request tu client, xu ly upload, goi Python model API.
- Python inference API: nap model TensorFlow va tra ket qua du doan qua endpoint `/predict`.

## 2) Cai dat

Yeu cau:
- Node.js 18+
- Python environment da cai package trong `python/requirements.txt`

Trong thu muc `backend`:

```bash
npm install
```

Tao file `.env` tu `.env.example`:

```bash
copy .env.example .env
```

## 3) Chay Python inference API (tach rieng)

Trong thu muc `backend/python`:

```bash
pip install -r requirements.txt
```

Chay API model:

```bash
python image_inference_api.py
```

Mac dinh Python API chay tai `http://127.0.0.1:8000`.

Mac dinh API su dung model `../skin_cancer_model.h5` (file duoc tao boi `train.py` o thu muc goc du an).

- Health: `GET /health`
- Predict: `POST /predict` (JSON co `image_base64`)

## 4) Chay Node backend

```bash
npm run dev
```

Hoac:

```bash
npm start
```

Mac dinh server chay o `http://localhost:3000`.

## 5) API

### Health

- `GET /health`

### Predict from image

- `POST /api/v1/predict/image`
- Content type: `multipart/form-data`
- Field file: `image`

Vi du cURL:

```bash
curl -X POST http://localhost:3000/api/v1/predict/image \
  -F "image=@../test_image/custom/your-image.jpg"
```

Node backend se goi sang Python inference API qua `IMAGE_MODEL_API_URL`.

### Predict from text (placeholder)

- `POST /api/v1/predict/text`
- Body JSON:

```json
{
  "symptoms": ["ngua", "do da", "bong vay"],
  "metadata": {
    "age": 25,
    "gender": "female"
  }
}
```

Hien tai endpoint text tra ve `501 Not Implemented` de bao model chua duoc tich hop.

## 6) Tich hop model text sau nay

Khi ban co model text, thay doi file:
- `src/services/textModelService.js`

Nen tach thanh mot Python text API rieng va de Node goi qua HTTP nhu image model.

## 7) Bien moi truong

- `PORT`: cong server
- `IMAGE_MODEL_API_URL`: endpoint predict cua Python API (vi du `http://127.0.0.1:8000/predict`)
- `IMAGE_MODEL_TIMEOUT_MS`: timeout goi Python API (ms)
- `UPLOAD_DIR`: thu muc luu file tam
- `MAX_IMAGE_SIZE_MB`: gioi han kich thuoc anh upload

Bien moi truong dung cho Python API:
- `MODEL_PATH`: duong dan toi file model `.h5`
- `MODEL_API_HOST`: host bind (mac dinh `127.0.0.1`)
- `MODEL_API_PORT`: cong Python API (mac dinh `8000`)
- `MODEL_API_DEBUG`: bat debug Flask (`true` hoac `false`)
