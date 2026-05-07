# Administrador de contenido con Supabase

App web hecha con TypeScript, Next.js, React y Tailwind CSS para administrar imagenes y contenido en Supabase.

## Funciones

- Login contra la tabla `usuarios`.
- CRUD de `paquetes`: `titulo`, `imagen`, `paquete`.
- CRUD de `salidas`: `nombre`, `imagen`, `mes`, `info`.
- CRUD de `usuarios`: `name`, `email`, `password`, `rol`, `createdAt`.
- Subida de imagenes a Supabase Storage.
- Selector de paquete leyendo la tabla catalogo `paquete` (`nombre`, `codigo`).

## Configuracion

1. Copia `.env.example` a `.env.local`.
2. Completa:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `SUPABASE_STORAGE_BUCKET`
   - `ADMIN_SESSION_SECRET`
3. En Supabase Storage crea un bucket llamado `imagenes` o cambia la variable.

> La app usa API routes del servidor para no exponer la `service_role_key` en el navegador.

## Comandos

```bash
npm install
npm run dev
```

Despues abre `http://localhost:3000`.
