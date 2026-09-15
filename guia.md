# api_uploads_img — Documentación de rutas

API para almacenar imágenes organizadas por carpetas de negocio, con optimización automática de peso.

**Base URL (desarrollo):** `http://localhost:3000`

---

## POST /uploads

Sube una imagen, la optimiza (resize + conversión a WebP) y la guarda organizada por carpetas: `negocio/documento/`.

### Headers

```
Content-Type: multipart/form-data
```

### Body (form-data)

| Campo      | Tipo   | Requerido | Descripción                                                              |
|------------|--------|-----------|---------------------------------------------------------------------------|
| `imagen`   | File   | Sí        | Archivo de imagen (`image/jpeg`, `image/png`, `image/webp`)              |
| `negocio`  | string | Sí        | Nombre del negocio (define la carpeta raíz)                              |
| `documento`| string | No        | Nombre de la subcarpeta/documento. Si no se envía, se usa `"general"`    |

### Límites

- Tamaño máximo de archivo: **5 MB**
- Tipos permitidos: `image/jpeg`, `image/png`, `image/webp`

### Ejemplo de request (cURL)

```bash
curl -X POST http://localhost:3000/uploads \
  -F "imagen=@/ruta/local/producto.jpg" \
  -F "negocio=biplo" \
  -F "documento=inventario"
```

### Respuesta exitosa — `201 Created`

```json
{
  "negocio": "biplo",
  "documento": "inventario",
  "ruta": "/uploads/biplo/inventario/1721234567890.webp"
}
```

### Respuestas de error

**400 — Falta la imagen**
```json
{
  "statusCode": 400,
  "message": "No se envió ninguna imagen"
}
```

**400 — Tipo de archivo no permitido**
```json
{
  "statusCode": 400,
  "message": "Tipo de archivo no permitido: application/x-msdos-program"
}
```

**400 — Falta el campo `negocio`**
```json
{
  "statusCode": 400,
  "message": ["negocio must be a string"],
  "error": "Bad Request"
}
```

**500 — Error interno** (capturado por el filtro global de excepciones)
```json
{
  "statusCode": 500,
  "timestamp": "2026-07-24T11:20:58.000Z",
  "path": "/uploads",
  "message": "Error interno del servidor"
}
```

---

## PATCH /uploads/:negocio/:documento/:archivo

Reemplaza el contenido de una imagen existente, manteniendo la misma ruta/nombre de archivo. La nueva imagen también se optimiza (resize + WebP).

### Headers

```
Content-Type: multipart/form-data
```

### Parámetros de ruta

| Parámetro   | Descripción                        |
|-------------|-------------------------------------|
| `negocio`   | Nombre del negocio                  |
| `documento` | Nombre del documento/carpeta        |
| `archivo`   | Nombre del archivo a reemplazar     |

### Body (form-data)

| Campo    | Tipo | Requerido | Descripción                          |
|----------|------|-----------|----------------------------------------|
| `imagen` | File | Sí        | Nueva imagen que reemplaza la actual  |

### Ejemplo de request (cURL)

```bash
curl -X PATCH http://localhost:3000/uploads/biplo/inventario/1721234567890.webp \
  -F "imagen=@/ruta/local/nueva-foto.jpg"
```

### Respuesta exitosa — `200 OK`

```json
{
  "message": "Imagen actualizada correctamente",
  "ruta": "/uploads/biplo/inventario/1721234567890.webp"
}
```

### Respuestas de error

**400 — Falta la imagen**
```json
{
  "statusCode": 400,
  "message": "No se envió ninguna imagen"
}
```

**404 — Imagen no encontrada**
```json
{
  "statusCode": 404,
  "message": "La imagen no existe"
}
```

---

## DELETE /uploads/:negocio/:documento/:archivo

Elimina físicamente una imagen del servidor.

### Parámetros de ruta

| Parámetro   | Descripción                    |
|-------------|----------------------------------|
| `negocio`   | Nombre del negocio                |
| `documento` | Nombre del documento/carpeta      |
| `archivo`   | Nombre del archivo a eliminar     |

### Ejemplo de request (cURL)

```bash
curl -X DELETE http://localhost:3000/uploads/biplo/inventario/1721234567890.webp
```

### Respuesta exitosa — `200 OK`

```json
{
  "message": "Imagen eliminada correctamente",
  "ruta": "/uploads/biplo/inventario/1721234567890.webp"
}
```

### Respuesta de error

**404 — Imagen no encontrada**
```json
{
  "statusCode": 404,
  "message": "La imagen no existe"
}
```

---

## GET /uploads/:negocio/:documento/:archivo

Sirve la imagen directamente como archivo estático (configurado con `useStaticAssets`).

### Ejemplo

```
GET /uploads/biplo/inventario/1721234567890.webp
```

Devuelve el archivo binario de la imagen (`Content-Type: image/webp`).

### Respuesta de error

**404 — Imagen no encontrada**
```json
{
  "statusCode": 404,
  "message": "Cannot GET /uploads/biplo/inventario/no-existe.webp"
}
```

---

## Estructura de carpetas resultante

```
uploads/
├── biplo/
│   ├── inventario/
│   │   └── 1721234567890.webp
│   └── general/
└── otro-negocio/
    └── general/
```

---

## Notas técnicas

- Las imágenes se procesan con **Sharp**: resize a máximo 1200px de ancho (sin agrandar imágenes más pequeñas) y conversión a **WebP** con calidad 80, para reducir el peso del archivo.
- Los nombres de `negocio` y `documento` se sanitizan (minúsculas, sin espacios, sin caracteres especiales) para evitar path traversal y nombres de carpeta inválidos.
- Todas las peticiones quedan registradas en consola vía `morgan('dev')`.