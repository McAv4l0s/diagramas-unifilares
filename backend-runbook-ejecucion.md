# Ejecucion Fase 1 - Backend NoSQL Gratuito

Este documento acompana la primera implementacion ejecutable del backend.

## Que queda incluido

- `backend/`: API Node nativa sin dependencias npm externas.
- `infra/docker-compose.yml`: CouchDB + backend.
- JWT HS256.
- Password hashing PBKDF2.
- CouchDB REST client.
- Bases iniciales:
  - `diagramas_users`
  - `diagramas_projects`
  - `diagramas_versions`
  - `diagramas_exports`
  - `diagramas_audit`
- CRUD base de proyectos.
- Versiones.
- Registro de solicitudes de exportacion PDF.

## Levantar arquitectura

Desde la raiz del repo:

```bash
cd infra
docker compose up --build
```

## Verificar health

```bash
curl http://localhost:3000/health
```

Respuesta esperada:

```json
{
  "status": "ok",
  "couchdb": "Welcome"
}
```

Si el navegador muestra:

```text
ERR_CONNECTION_REFUSED
```

significa que no hay ningun backend escuchando en `3000`. Levantar Docker Compose o correr el backend directo:

```bash
node backend/src/server.js
```

Si responde:

```json
{
  "status": "degraded",
  "couchdb": "down"
}
```

el backend ya esta encendido, pero CouchDB no esta disponible. En ese caso revisar Docker Desktop y levantar:

```bash
docker compose -f infra/docker-compose.yml up --build -d
```

## Verificar bases construidas

```bash
curl http://admin:change-me-local@localhost:5984/_all_dbs
```

La respuesta debe incluir:

```text
_users
_replicator
_global_changes
diagramas_users
diagramas_projects
diagramas_versions
diagramas_exports
diagramas_audit
```

Si CouchDB muestra el aviso:

```text
chttpd_auth_cache changes listener died because the _users database does not exist
```

crear las bases del sistema o reiniciar el backend actualizado. La inicializacion ya crea automaticamente:

```text
_users
_replicator
_global_changes
```

## Crear usuario

```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "content-type: application/json" \
  -d '{"email":"admin@example.com","password":"super-secret-123","displayName":"Admin"}'
```

Guardar el `token`.

## Crear proyecto

```bash
TOKEN="pega-aqui-el-token"

curl -X POST http://localhost:3000/api/projects \
  -H "authorization: Bearer $TOKEN" \
  -H "content-type: application/json" \
  -d '{"name":"Oficina y almacen","location":"CDMX","snapshot":{"circuits":[]}}'
```

## Crear version

```bash
PROJECT_ID="project:..."

curl -X POST "http://localhost:3000/api/projects/$PROJECT_ID/versions" \
  -H "authorization: Bearer $TOKEN" \
  -H "content-type: application/json" \
  -d '{"status":"draft","snapshot":{"project":{"projectName":"Oficina y almacen"},"circuits":[]}}'
```

## Registrar exportacion PDF

```bash
curl -X POST "http://localhost:3000/api/projects/$PROJECT_ID/exports/complete-pdf" \
  -H "authorization: Bearer $TOKEN"
```

## Flujo operativo despues de DB

1. Levantar `couchdb` y `backend` con Docker Compose.
2. Confirmar `GET /health`.
3. Confirmar que existen bases de sistema y bases de aplicacion.
4. Registrar o autenticar usuario.
5. Guardar proyecto con snapshot completo de la PWA.
6. Crear version por cada cambio importante del unifilar.
7. Registrar exportacion PDF como evento auditable.
8. En Fase 2, mover la generacion real del PDF al backend para tener salida consistente.

## Probar desde la PWA

Levantar la app estatica local:

```bash
python3 -m http.server 8000
```

Abrir:

```text
http://localhost:8000
```

Entrar a la seccion:

```text
Backend
```

Flujo recomendado:

1. Confirmar `API URL = http://localhost:3000`.
2. Escribir email y password.
3. Click `Registrar` para crear usuario, o `Login` si ya existe.
4. Click `Guardar nuevo` para enviar el snapshot actual a CouchDB.
5. Click `Listar` para ver proyectos guardados.
6. Seleccionar proyecto.
7. Click `Crear version` para guardar un snapshot versionado.
8. Click `Cargar` para recuperar el snapshot desde CouchDB y reemplazar el formulario actual.

Nota:

La version publicada en GitHub Pages puede tener restricciones al comunicarse con un backend local `http://localhost:3000`. Para pruebas de arquitectura usar la app local en `http://localhost:8000`.

## Pruebas unitarias

Ejecutar desde la raiz del repo `diagramas-unifilares`, no desde `~`.

Frontend:

```bash
node --test tests/unifilar-script.test.mjs
```

Backend:

```bash
node --test backend/tests/*.test.mjs
```

Si Node local falla por Homebrew o librerias del sistema, usar el Node del contenedor:

```bash
docker compose -f infra/docker-compose.yml exec backend sh -c 'node --test tests/*.test.mjs'
```

Cobertura actual validada:

- PDF simplificado sin cuadro de cargas.
- PDF completo con cuadro de cargas y resumen normativo mexicano.
- Descarga directa de UnifilarScript como PDF.
- Reductor estilo Redux para acciones principales.
- Payload backend con snapshot completo.
- Hash de password, JWT, CouchDB client y validacion de proyectos.

## Prueba de humo operativa

Con Docker Compose arriba, ejecutar:

```bash
node backend/scripts/smoke.mjs
```

Si Node local falla, ejecutar dentro del contenedor:

```bash
docker compose -f infra/docker-compose.yml exec backend node scripts/smoke.mjs
```

Esta prueba valida comunicaciones reales contra `http://localhost:3000`:

1. Registro de usuario.
2. Creacion de proyecto.
3. Lectura de proyecto.
4. Creacion de version.
5. Registro de exportacion `complete_pdf`.

Salida esperada:

```json
{
  "ok": true,
  "user": "smoke-...",
  "projectId": "project:...",
  "versionId": "version:...",
  "exportId": "export:..."
}
```

## Siguiente fase

La Fase 2 debe implementar:

- Generacion real de PDF en backend.
- PouchDB local.
- Sync offline-first.
- UI para login/proyectos.
