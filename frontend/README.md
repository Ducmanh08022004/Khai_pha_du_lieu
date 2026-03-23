# React + Vite

## Chạy web (Frontend + Backend)

### 1) Chạy backend + model

Trong thư mục `backend`:

```bash
npm install
npm run dev:all
```

`dev:all` sẽ tự chạy:
- Python image inference API: `http://127.0.0.1:8000`
- Python text inference API: `http://127.0.0.1:8001`
- Node backend: `http://localhost:3000`

Nếu bạn muốn chạy thủ công Python API, xem hướng dẫn trong `backend/README.md`.

### 2) Chạy frontend

Trong thư mục `frontend`:

```bash
npm install
npm run dev
```

Mặc định frontend sẽ gọi backend tại `http://localhost:3000`.

Nếu backend chạy port khác, tạo file `.env` trong `frontend`:

```bash
VITE_BACKEND_URL=http://localhost:3000
```

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Oxc](https://oxc.rs)
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/)

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.
