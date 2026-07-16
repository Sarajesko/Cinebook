# Cinebook — Checklist de construcción

Basado en [`contexto.md`](contexto.md).  
Metáfora UI: **sala de lectura de cine** (ver [`ideas.md`](ideas.md)).

---

## Cómo usar este checklist

1. Solo se trabaja **un apartado a la vez** (el marcado como `EN CURSO`).
2. Al terminar ese apartado, se rellena **Qué se ha hecho** y se marca `[x]`.
3. **No se pasa al siguiente** hasta que en el chat se escriba exactamente: `siguiente`.
4. Estados posibles: `PENDIENTE` · `EN CURSO` · `HECHO`.

**Apartado en curso ahora:** `02 — Modelo de datos y base de datos`

---

## Progreso

| # | Apartado | Estado |
|---|----------|--------|
| 01 | Scaffold del monorepo y stack | HECHO |
| 02 | Modelo de datos y base de datos | EN CURSO |
| 03 | Auth (registro, login, JWT) | PENDIENTE |
| 04 | API CRUD de libros | PENDIENTE |
| 05 | Anti-duplicado (ISBN + título/autor/editorial) | PENDIENTE |
| 06 | API wishlist (deseados) | PENDIENTE |
| 07 | API estadísticas | PENDIENTE |
| 08 | Front Angular: shell, rutas, auth UI | PENDIENTE |
| 09 | Catálogo: listado y ficha (sala de lectura) | PENDIENTE |
| 10 | Alta / edición de libros + carátula | PENDIENTE |
| 11 | Filtros y búsqueda | PENDIENTE |
| 12 | Escaneo de ISBN | PENDIENTE |
| 13 | Wishlist UI | PENDIENTE |
| 14 | Estadísticas UI | PENDIENTE |
| 15 | Pulido visual y criterios de calidad | PENDIENTE |

---

## 01 — Scaffold del monorepo y stack

**Estado:** `HECHO`  
**Ref. contexto:** §6 Arquitectura MVC · §7 Stack

### Objetivo

Dejar la base del proyecto lista para desarrollar:

- Front: Angular (View)
- Back: NestJS (Controller)
- BD: SQLite para prototipo local (PostgreSQL más adelante)
- Auth preparada para JWT
- Estructura MVC clara

### Checklist

- [x] Repositorio / carpetas `frontend` y `backend` (o equivalente)
- [x] App Angular creada y arranca
- [x] App NestJS creada y arranca
- [x] Variables de entorno de ejemplo (sin secretos reales)
- [x] README mínimo: cómo levantar front y back

### Qué se ha hecho

- Creadas carpetas `frontend/` (Angular 19) y `backend/` (NestJS 11).
- Nest: prefijo global `/api`, CORS hacia `localhost:4200`, mensaje de salud en `GET /api`.
- Angular: shell mínimo con marca **Cinebook** + subtexto **Cinema Library** (atmósfera oscura provisional).
- `.env.example` en backend (PORT, CORS, JWT placeholders, DATABASE_URL) y frontend (URL API).
- `backend/.env` local copiado desde el example (no versionar).
- README raíz con instrucciones de arranque; `.gitignore` raíz.
- Builds verificados: `backend` (`nest build`) y `frontend` (`ng build`) OK.

**Nota:** Prisma/SQLite reales quedan para el apartado 02; aquí solo el placeholder `DATABASE_URL` y JWT en env.

---

## 02 — Modelo de datos y base de datos

**Estado:** `EN CURSO`  
**Ref. contexto:** §5 Modelo de datos

### Objetivo

Persistir **Usuario**, **Libro** y **Deseado** con todos los campos de v1.

### Checklist

- [ ] Entidad / tabla Usuario
- [ ] Entidad / tabla Libro (campos obligatorios + figuras + carátula + notas)
- [ ] Entidad / tabla Deseado (wishlist)
- [ ] Enums: `lengua`, `estado`
- [ ] Migraciones o sync inicial
- [ ] Relación `usuario_id` en Libro y Deseado

### Qué se ha hecho

_Pendiente._

---

## 03 — Auth (registro, login, JWT)

**Estado:** `PENDIENTE`  
**Ref. contexto:** §4.1 · §7 Auth

### Objetivo

Registro/login; rutas de API protegidas con JWT.

### Checklist

- [ ] Registro de usuario (hash de contraseña)
- [ ] Login → JWT
- [ ] Guard / middleware en rutas privadas
- [ ] Endpoints de prueba protegidos OK

### Qué se ha hecho

_Pendiente._

---

## 04 — API CRUD de libros

**Estado:** `PENDIENTE`  
**Ref. contexto:** §4.2–4.8 · §8

### Objetivo

CRUD completo de libros del usuario autenticado, con validación de campos obligatorios.

### Checklist

- [ ] Crear libro
- [ ] Listar (solo del usuario)
- [ ] Detalle
- [ ] Editar
- [ ] Eliminar
- [ ] Validación: título, autores, año, editorial, lengua, país, ISBN, estado, fecha_compra
- [ ] Figuras del cine opcionales
- [ ] Carátula (URL o upload básico)

### Qué se ha hecho

_Pendiente._

---

## 05 — Anti-duplicado (ISBN + título/autor/editorial)

**Estado:** `PENDIENTE`  
**Ref. contexto:** §4.14

### Objetivo

Avisar «¿Ya tienes este?» antes de confirmar el alta/edición.

### Checklist

- [ ] Match prioritario por ISBN
- [ ] Fallback título + autor + editorial
- [ ] Respuesta de API que permita aviso no bloqueante en el front
- [ ] Si coincide con deseado, flag para ofrecer quitarlo de wishlist

### Qué se ha hecho

_Pendiente._

---

## 06 — API wishlist (deseados)

**Estado:** `PENDIENTE`  
**Ref. contexto:** §4.12 · §5 Deseado

### Objetivo

CRUD de deseados y flujo “pasar a colección”.

### Checklist

- [ ] Crear / listar / editar / eliminar deseado
- [ ] Endpoint o lógica: convertir deseado → libro (estado `recien_comprado`)
- [ ] Detección al alta de libro si el ISBN/título está en wishlist

### Qué se ha hecho

_Pendiente._

---

## 07 — API estadísticas

**Estado:** `PENDIENTE`  
**Ref. contexto:** §4.13

### Objetivo

Endpoints agregados para la vista “La sala en números”.

### Checklist

- [ ] Conteos por lengua, país, década, editorial, estado
- [ ] Crecimiento temporal (altas / compras por periodo)
- [ ] Figuras más frecuentes (opcional en este apartado si cabe)
- [ ] Resumen wishlist (abiertos / conseguidos si aplica)

### Qué se ha hecho

_Pendiente._

---

## 08 — Front Angular: shell, rutas, auth UI

**Estado:** `PENDIENTE`  
**Ref. contexto:** §6 View · §3 Usuario · §10 Nombre

### Objetivo

Shell de **Cinebook — Cinema Library**, login/registro y rutas protegidas.

### Checklist

- [ ] Layout base (marca Cinebook + subtexto Cinema Library)
- [ ] Pantallas login / registro
- [ ] Guard de rutas autenticadas
- [ ] Servicio HTTP con token
- [ ] Navegación: catálogo, deseados, estadísticas

### Qué se ha hecho

_Pendiente._

---

## 09 — Catálogo: listado y ficha (sala de lectura)

**Estado:** `PENDIENTE`  
**Ref. contexto:** §8 · metáfora sala de lectura

### Objetivo

Listado y detalle con atmósfera de sala de lectura; carátulas; tiempo relativo desde compra.

### Checklist

- [ ] Listado / grid editorial con carátulas
- [ ] Ficha detalle (volumen en la mesa)
- [ ] Mostrar estado y «hace X» desde `fecha_compra`
- [ ] Empty state: “La sala de lectura está vacía…”

### Qué se ha hecho

_Pendiente._

---

## 10 — Alta / edición de libros + carátula

**Estado:** `PENDIENTE`  
**Ref. contexto:** §4.2–4.8

### Objetivo

Formularios de alta/edición con todos los campos v1 y carátula.

### Checklist

- [ ] Formulario crear
- [ ] Formulario editar
- [ ] Campos obligatorios + figuras + notas
- [ ] Carátula (URL y/o subida)
- [ ] Integración con aviso anti-duplicado
- [ ] Oferta de cerrar deseado si aplica

### Qué se ha hecho

_Pendiente._

---

## 11 — Filtros y búsqueda

**Estado:** `PENDIENTE`  
**Ref. contexto:** §4.9–4.10

### Objetivo

Filtrar y buscar en el catálogo según contexto.

### Checklist

- [ ] Filtros: lengua, país, estado, año, autor, editorial, director, guionista, actor, productor
- [ ] Búsqueda texto: título, autor, ISBN, figuras del cine
- [ ] UI sobria (sin clusters de pills genéricos)

### Qué se ha hecho

_Pendiente._

---

## 12 — Escaneo de ISBN

**Estado:** `PENDIENTE`  
**Ref. contexto:** §4.11

### Objetivo

Leer ISBN con la cámara y volcarlo al formulario; fallback manual.

### Checklist

- [ ] Botón “Escanear ISBN” en alta/edición
- [ ] Lectura de código de barras vía cámara
- [ ] Relleno del campo ISBN
- [ ] Disparo inmediato de anti-duplicado / wishlist
- [ ] Fallback escritura manual

### Qué se ha hecho

_Pendiente._

---

## 13 — Wishlist UI

**Estado:** `PENDIENTE`  
**Ref. contexto:** §4.12

### Objetivo

Pantallas de lista de deseados y paso a colección.

### Checklist

- [ ] Listado de deseados
- [ ] Alta / edición / borrado
- [ ] Acción “ya lo tengo” → alta en catálogo
- [ ] Contraste visual claro vs colección

### Qué se ha hecho

_Pendiente._

---

## 14 — Estadísticas UI

**Estado:** `PENDIENTE`  
**Ref. contexto:** §4.13 · ideas §7

### Objetivo

Pantalla “La sala en números”, cuidada y no genérica.

### Checklist

- [ ] Vista de estadísticas conectada a la API
- [ ] Composición por lengua, país, década, editorial, estado
- [ ] Crecimiento en el tiempo
- [ ] Resumen wishlist
- [ ] Estética alineada con sala de lectura

### Qué se ha hecho

_Pendiente._

---

## 15 — Pulido visual y criterios de calidad

**Estado:** `PENDIENTE`  
**Ref. contexto:** §9 · §10

### Objetivo

Cerrar v1 con UI profesional cinematográfica y flujos revisados.

### Checklist

- [ ] Tipografía y atmósfera sala de lectura
- [ ] Responsive básico (consulta en móvil)
- [ ] Revisar campos obligatorios en UI
- [ ] Revisar anti-duplicado + escaneo + wishlist end-to-end
- [ ] README final de uso

### Qué se ha hecho

_Pendiente._

---

## Registro de avances (diario breve)

| Fecha | Apartado | Nota |
|-------|----------|------|
| 2026-07-16 | 01 | Scaffold Angular + NestJS, env examples, README, builds OK. |
