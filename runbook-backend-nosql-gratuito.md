# Runbook Backend NoSQL Gratuito - Diagramas Unifilares

Fecha: 2026-07-30

## 1. Objetivo

Crear un backend solido, gratuito y mantenible para la aplicacion **Diagramas Unifilares**, usando una base de datos NoSQL sin costo de licencia y preparada para sincronizacion con una PWA.

La meta es que la aplicacion deje de depender solo de `localStorage` y pueda:

- Guardar proyectos.
- Guardar versiones.
- Guardar circuitos y cuadro de cargas.
- Guardar exportaciones PDF.
- Sincronizar datos entre navegador y backend.
- Trabajar offline cuando sea necesario.
- Mantener estructura de comunicaciones clara entre frontend, backend y base de datos.

## 2. Decision Tecnica Principal

Usar:

```text
Frontend PWA: React
Estado local: PouchDB
Backend API: Node.js + Fastify
Base NoSQL: CouchDB
Contenedores: Docker Compose
Autenticacion: JWT
Validacion: JSON Schema
Documentos PDF: servicio backend o worker
```

## 3. Por Que CouchDB + PouchDB

### Ventajas

- CouchDB es NoSQL.
- CouchDB es open source.
- No requiere pago por licencia.
- Puede correr localmente, en una laptop, servidor propio o VPS.
- PouchDB corre dentro del navegador.
- PouchDB permite modo offline.
- PouchDB sincroniza con CouchDB.
- El modelo por documentos JSON encaja con proyectos electricos versionados.

### Encaje con campo

Un usuario puede capturar un levantamiento sin internet:

```text
PWA -> PouchDB local -> trabajo offline
```

Cuando vuelve internet:

```text
PouchDB local -> sync -> CouchDB servidor
```

## 4. Arquitectura General

```text
Usuario / Tecnico
  |
  v
PWA React
  |
  | Guarda localmente
  v
PouchDB en navegador
  |
  | Sincronizacion
  v
Backend API Node/Fastify
  |
  | Validacion, auth, reglas de negocio
  v
CouchDB NoSQL
  |
  v
Documentos JSON: proyectos, versiones, circuitos, exports
```

## 5. Responsabilidad de Cada Capa

### Frontend PWA

Responsabilidades:

- Captura de datos.
- UI/UX.
- Validacion basica inmediata.
- Render del diagrama.
- Edicion avanzada de UnifilarScript.
- Cache offline.
- Sincronizacion con backend.
- Solicitud de exportaciones PDF.

No debe:

- Ser la unica fuente persistente.
- Inventar calculos normativos.
- Guardar documentos finales solo en memoria local.

### PouchDB

Responsabilidades:

- Guardar datos localmente en el navegador.
- Permitir trabajo offline.
- Mantener cola de cambios.
- Sincronizar con CouchDB.

### Backend API

Responsabilidades:

- Autenticacion.
- Autorizacion.
- Validacion con JSON Schema.
- Control de versiones.
- Reglas de negocio.
- Normalizacion de documentos.
- Generacion o registro de PDFs.
- Puente seguro entre app y CouchDB.

### CouchDB

Responsabilidades:

- Persistir documentos.
- Replicar cambios.
- Mantener revision `_rev`.
- Servir como NoSQL central.

## 6. Estructura Recomendada del Repositorio

```text
diagramas-unifilares/
  frontend/
    src/
      app/
      components/
      state/
      domain/
      documents/
      services/
      db/
        pouch.js
        sync.js
    public/
    package.json

  backend/
    src/
      server.js
      config/
        env.js
      auth/
        jwt.js
        password.js
        middleware.js
      db/
        couch.js
        init.js
        repositories/
          projectRepository.js
          userRepository.js
          exportRepository.js
      modules/
        projects/
          project.routes.js
          project.service.js
          project.schema.js
        versions/
          version.routes.js
          version.service.js
          version.schema.js
        exports/
          export.routes.js
          export.service.js
          export.schema.js
        auth/
          auth.routes.js
          auth.service.js
      services/
        pdf/
          simplePdf.js
          completePdf.js
        unifilar/
          parser.js
          generator.js
          validator.js
      utils/
        errors.js
        logger.js
    tests/
    package.json

  infra/
    docker-compose.yml
    couchdb/
      local.ini
    nginx/
      nginx.conf

  docs/
    runbooks/
```

## 7. Docker Compose Base

Archivo sugerido:

```yaml
services:
  couchdb:
    image: couchdb:3.3
    container_name: diagramas-couchdb
    restart: unless-stopped
    ports:
      - "5984:5984"
    environment:
      COUCHDB_USER: admin
      COUCHDB_PASSWORD: change-me-local
    volumes:
      - couchdb_data:/opt/couchdb/data

  backend:
    build:
      context: ../backend
    container_name: diagramas-backend
    restart: unless-stopped
    ports:
      - "3000:3000"
    environment:
      NODE_ENV: production
      PORT: 3000
      COUCHDB_URL: http://admin:change-me-local@couchdb:5984
      JWT_SECRET: change-me-super-secret
    depends_on:
      - couchdb

volumes:
  couchdb_data:
```

## 8. Bases de Datos CouchDB

Crear bases separadas:

```text
diagramas_users
diagramas_projects
diagramas_versions
diagramas_exports
diagramas_audit
```

### users

```json
{
  "_id": "user:uuid",
  "type": "user",
  "email": "usuario@example.com",
  "passwordHash": "...",
  "displayName": "Carlo",
  "role": "admin",
  "createdAt": "2026-07-30T00:00:00.000Z",
  "updatedAt": "2026-07-30T00:00:00.000Z"
}
```

### projects

```json
{
  "_id": "project:uuid",
  "type": "project",
  "ownerId": "user:uuid",
  "name": "Oficina y almacen",
  "location": "CDMX",
  "status": "draft",
  "currentVersionId": "version:uuid",
  "createdAt": "2026-07-30T00:00:00.000Z",
  "updatedAt": "2026-07-30T00:00:00.000Z"
}
```

### versions

```json
{
  "_id": "version:uuid",
  "type": "version",
  "projectId": "project:uuid",
  "versionNumber": 1,
  "status": "draft",
  "snapshot": {
    "project": {},
    "service": {},
    "system": {},
    "panel": {},
    "grounding": {},
    "stps": {},
    "circuits": []
  },
  "createdBy": "user:uuid",
  "createdAt": "2026-07-30T00:00:00.000Z"
}
```

### exports

```json
{
  "_id": "export:uuid",
  "type": "export",
  "projectId": "project:uuid",
  "versionId": "version:uuid",
  "exportType": "simple_pdf",
  "fileName": "diagrama-unifilar-simplificado.pdf",
  "storageType": "couch_attachment",
  "createdAt": "2026-07-30T00:00:00.000Z"
}
```

## 9. API Minima

### Auth

```text
POST /api/auth/register
POST /api/auth/login
GET  /api/auth/me
```

### Projects

```text
GET    /api/projects
POST   /api/projects
GET    /api/projects/:projectId
PATCH  /api/projects/:projectId
DELETE /api/projects/:projectId
```

### Versions

```text
GET  /api/projects/:projectId/versions
POST /api/projects/:projectId/versions
GET  /api/projects/:projectId/versions/:versionId
```

### Exports

```text
POST /api/projects/:projectId/exports/simple-pdf
POST /api/projects/:projectId/exports/complete-pdf
GET  /api/projects/:projectId/exports
GET  /api/projects/:projectId/exports/:exportId/download
```

### Sync

Dos opciones:

1. Sincronizacion directa PouchDB <-> CouchDB.
2. Sincronizacion mediada por backend.

Recomendacion inicial:

```text
PWA -> Backend API para operaciones normales
PouchDB -> CouchDB solo para sync controlada cuando ya haya auth y permisos definidos
```

## 10. Comunicaciones

### Flujo de guardado online

```text
Usuario edita proyecto
  |
Frontend dispatch UPDATE_FIELD
  |
PouchDB guarda cambio local
  |
Frontend llama PATCH /api/projects/:id
  |
Backend valida JSON Schema
  |
Backend guarda en CouchDB
  |
Backend responde version/rev
  |
Frontend actualiza estado sincronizado
```

### Flujo offline

```text
Usuario edita sin internet
  |
Frontend guarda en PouchDB
  |
Estado queda pendingSync
  |
Regresa internet
  |
Sync envia cambios
  |
Backend/CouchDB resuelve revision
```

### Flujo PDF

```text
Usuario selecciona Exportar -> PDF completo
  |
Frontend valida campos minimos
  |
POST /api/projects/:id/exports/complete-pdf
  |
Backend toma snapshot versionado
  |
Backend genera PDF
  |
Backend guarda attachment o archivo
  |
Frontend descarga PDF
```

## 11. Validacion JSON Schema

Cada payload debe validarse antes de guardar.

Ejemplo proyecto:

```json
{
  "type": "object",
  "required": ["name", "ownerId"],
  "properties": {
    "name": { "type": "string", "minLength": 1 },
    "location": { "type": "string" },
    "status": { "enum": ["draft", "review", "issued", "archived"] }
  }
}
```

Ejemplo circuito:

```json
{
  "type": "object",
  "required": ["displayName", "breaker", "conductor"],
  "properties": {
    "displayName": { "type": "string" },
    "origin": { "type": "string" },
    "destination": { "type": "string" },
    "breaker": { "type": "string" },
    "conductor": { "type": "string" },
    "loadSchedule": {
      "type": "object",
      "properties": {
        "phase": { "type": "string" },
        "installedVa": { "type": "string" },
        "demandedVa": { "type": "string" },
        "currentA": { "type": "string" }
      }
    }
  }
}
```

## 12. Seguridad

### Minimo necesario

- JWT firmado.
- Passwords con hash fuerte.
- Variables secretas fuera del repo.
- CORS restringido.
- Rate limit en login.
- Validacion de payload.
- Sanitizacion de textos que van a PDF.
- Logs sin datos sensibles.

### Permisos

Roles:

```text
admin
editor
viewer
```

Reglas:

- `admin`: puede crear, editar, borrar y exportar.
- `editor`: puede editar y exportar.
- `viewer`: solo lectura y descarga.

## 13. Versionado de Proyectos

No sobrescribir historiales importantes.

Cada vez que se exporte un PDF formal:

```text
Crear version snapshot
Generar PDF desde esa version
Guardar export record
Marcar version como issued si aplica
```

Estados:

```text
draft
review
issued
archived
```

## 14. Estrategia Offline

### PouchDB local

Bases locales:

```text
diagramas_projects_local
diagramas_queue_local
diagramas_exports_cache
```

### Estado de sincronizacion

Cada documento local debe tener:

```json
{
  "syncStatus": "synced|pending|conflict|error",
  "lastSyncedAt": "..."
}
```

### Conflictos

Regla inicial:

- Si dos cambios editan campos distintos, fusionar.
- Si dos cambios editan el mismo campo, guardar conflicto y pedir decision.
- Nunca perder datos automaticamente.

## 15. Generacion PDF

### Recomendacion

Mover generacion PDF al backend para documentos formales.

Opciones:

- PDFKit: control programatico.
- Playwright HTML to PDF: mejor layout visual.
- React PDF: componentes declarativos.

Recomendacion inicial:

```text
HTML template + Playwright/Puppeteer server-side
```

Ventajas:

- Mejor diseno.
- Mejor control de tablas.
- Portada profesional.
- Separacion entre datos y render.

## 16. Plan de Implementacion

### Fase 0: Congelar alcance

- Definir campos obligatorios.
- Definir proveedor NoSQL: CouchDB.
- Definir si habra login.
- Definir formato PDF.

### Fase 1: Backend base

- Crear carpeta `backend`.
- Crear Fastify server.
- Crear Docker Compose con CouchDB.
- Crear conexion CouchDB.
- Crear healthcheck.
- Crear init de bases.

Entregable:

```text
GET /health -> ok
CouchDB corriendo
Bases creadas
```

### Fase 2: Auth

- Registro.
- Login.
- JWT.
- Middleware auth.
- Usuario admin inicial.

Entregable:

```text
POST /api/auth/login -> token
GET /api/auth/me -> usuario
```

### Fase 3: Proyectos

- CRUD proyectos.
- Validacion JSON Schema.
- Repositorio CouchDB.

Entregable:

```text
Crear proyecto
Listar proyectos
Editar proyecto
Archivar proyecto
```

### Fase 4: Versiones

- Crear snapshot.
- Listar versiones.
- Restaurar version.

Entregable:

```text
POST /versions crea snapshot inmutable
```

### Fase 5: Exportaciones

- Generar PDF simple.
- Generar PDF completo.
- Guardar export record.
- Descargar PDF.

Entregable:

```text
PDF generado desde version
PDF descargable
```

### Fase 6: PWA Sync

- Instalar PouchDB en frontend.
- Guardar local.
- Sincronizar con backend/CouchDB.
- Mostrar estado de sincronizacion.

Entregable:

```text
Offline edit
Online sync
Conflict detection
```

## 17. Comandos Locales Esperados

### Levantar infraestructura

```bash
cd infra
docker compose up -d
```

### Backend

```bash
cd backend
npm install
npm run dev
```

### Frontend

```bash
cd frontend
npm install
npm run dev
```

## 18. Variables de Entorno

Backend `.env`:

```env
NODE_ENV=development
PORT=3000
COUCHDB_URL=http://admin:change-me-local@localhost:5984
JWT_SECRET=change-me-super-secret
CORS_ORIGIN=http://localhost:5173
```

Frontend `.env`:

```env
VITE_API_URL=http://localhost:3000
VITE_POUCHDB_PREFIX=diagramas
```

## 19. Pruebas Necesarias

### Backend unit tests

- Auth service.
- Project repository.
- Version service.
- Export service.
- JSON Schema validation.

### Integration tests

- Crear usuario.
- Login.
- Crear proyecto.
- Crear version.
- Generar PDF.
- Descargar PDF.

### Frontend tests

- Reducer.
- Selectors.
- Validaciones.
- Botones de exportacion.
- Sync status.

## 20. Prompt Para Construir El Backend

```text
Crea el backend de Diagramas Unifilares usando Node.js, Fastify, CouchDB y Docker Compose.

Requisitos:
- Base NoSQL gratuita con CouchDB.
- API REST robusta.
- JWT auth.
- JSON Schema validation.
- Modulos: auth, projects, versions, exports.
- Repositorios separados para CouchDB.
- Healthcheck.
- Docker Compose con CouchDB y backend.
- Variables de entorno.
- Tests unitarios e integracion.

Modelo:
- users
- projects
- versions
- exports
- audit

Reglas:
- No usar servicios pagados.
- No depender de localStorage como persistencia final.
- Mantener snapshots versionados.
- Generar PDF desde snapshot, no desde estado mutable.
- Preparar integracion futura con PouchDB offline-first.

Entrega:
- Codigo backend.
- docker-compose.yml.
- README de ejecucion.
- Tests.
```

## 21. Decisiones Pendientes

Antes de construir:

1. Confirmar CouchDB como base NoSQL final.
2. Confirmar si habra login real desde el primer MVP.
3. Confirmar si los PDFs se guardan como attachments en CouchDB o como archivos en disco.
4. Confirmar si el backend vivira local, en red privada o en servidor publico.
5. Confirmar si el frontend actual se adapta o se rehace en carpeta nueva.

## 22. Recomendacion Final

La estructura fundamental de comunicaciones debe ser:

```text
Frontend PWA
  -> Store/reducer
  -> PouchDB local
  -> API Fastify
  -> CouchDB
  -> Versiones/exports
```

No conviene seguir agregando funcionalidades encima de una app puramente estatica si el objetivo ya es guardar proyectos, versiones y documentos.

El siguiente paso correcto es construir el backend base con Docker Compose y CouchDB.

