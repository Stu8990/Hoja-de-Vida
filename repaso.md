# WatchPartyWeb - Resumen Técnico del Proyecto

## Descripción General

**WatchPartyWeb** es una aplicación web que permite a múltiples usuarios ver videos sincronizados en tiempo real dentro de salas virtuales. La plataforma facilita la experiencia de "watch party" donde un anfitrión (host) controla la reproducción y todos los participantes ven el contenido de forma sincronizada.

---

## Stack Tecnológico

### Backend
| Tecnología | Versión | Propósito |
|------------|---------|-----------|
| .NET | 8.0 | Runtime principal |
| ASP.NET Core | 8.0 | Framework web |
| Entity Framework Core | 8.0 | ORM para base de datos |
| PostgreSQL | - | Base de datos relacional |
| WebSockets | Nativo | Comunicación en tiempo real |
| JWT | - | Autenticación de usuarios |

### Frontend
| Tecnología | Versión | Propósito |
|------------|---------|-----------|
| Angular | 17 | Framework SPA |
| TypeScript | 5.2 | Lenguaje de programación |
| RxJS | - | Programación reactiva |
| CSS3 | - | Estilos (Glassmorphism) |

---

## Estructura del Proyecto

```
WatchPartyWeb/
├── Backend/
│   ├── Program.cs                 # Punto de entrada y configuración principal
│   ├── Models/                    # Modelos de datos
│   │   ├── User.cs               # Usuario del sistema
│   │   ├── Friend.cs             # Relaciones de amistad
│   │   ├── Room.cs               # Sala en memoria
│   │   ├── RoomEntity.cs         # Sala persistente en BD
│   │   ├── VideoState.cs         # Estado del video
│   │   ├── VideoQueue.cs         # Cola de reproducción
│   │   ├── QueueItem.cs          # Item de la cola
│   │   ├── ScheduledVideo.cs     # Videos programados
│   │   └── WebSocketMessage.cs   # Mensajes WebSocket
│   ├── Services/                  # Lógica de negocio
│   │   ├── RoomManager.cs        # Gestión de salas y WebSockets
│   │   ├── AuthService.cs        # Autenticación JWT
│   │   ├── FriendService.cs      # Sistema de amigos
│   │   ├── RoomService.cs        # Persistencia de salas
│   │   ├── NotificationManager.cs # Notificaciones en tiempo real
│   │   ├── QueueSchedulerService.cs # Planificador de videos
│   │   └── VideoStorageCleanupService.cs # Limpieza de archivos
│   ├── Controllers/               # API REST
│   │   ├── VideoQueueController.cs
│   │   └── ScheduledVideoController.cs
│   ├── Data/
│   │   └── WatchPartyDbContext.cs # Contexto de Entity Framework
│   └── Soap/
│       └── SoapRequestHandler.cs  # Manejo de SOAP legacy
│
├── Frontend/src/app/
│   ├── components/                # Componentes UI
│   │   ├── home/                 # Página principal
│   │   ├── room/                 # Sala de video (componente principal)
│   │   ├── login/                # Formulario de login
│   │   ├── register/             # Formulario de registro
│   │   ├── video-queue/          # Gestión de cola
│   │   ├── theme-selector/       # Selector de temas
│   │   └── toast/                # Notificaciones
│   └── services/                  # Servicios
│       ├── socket.service.ts     # Comunicación WebSocket
│       ├── auth.service.ts       # Autenticación
│       ├── queue.service.ts      # API de cola
│       ├── user.service.ts       # API de usuarios
│       ├── cast.service.ts       # Google Cast
│       ├── airplay.service.ts    # Apple AirPlay
│       └── theme.service.ts      # Gestión de temas
│
└── Dockerfile                     # Configuración de Docker
```

---

## Flujo de Funcionamiento

### 1. Autenticación

```
Usuario → POST /api/auth/register → Crear cuenta → JWT Token
Usuario → POST /api/auth/login → Validar credenciales → JWT Token
```

- Las contraseñas se hashean con SHA256
- El token JWT tiene validez de 7 días
- El token incluye: userId, username, email

### 2. Creación de Sala

```
Usuario autenticado → POST /api/rooms/create → RoomEntity en BD
                                             → Room en memoria
                                             → Código de 6 caracteres
```

**Tipos de visibilidad:**
- `Public`: Cualquiera puede ver y unirse
- `Private`: Solo el dueño puede acceder
- `Friends`: Solo amigos del dueño pueden ver y unirse

### 3. Conexión WebSocket

```
Cliente → WS /ws/{roomId}?userId=...&username=...&sessionKey=...
       ← "welcome" (confirmación de conexión)
       ← "room_state" (lista de participantes)
       ← "video_ready" (estado actual del video)
```

### 4. Sincronización de Video

```
Host ejecuta PLAY:
  Host → Server: { type: "play", timestamp: 45.2 }
  Server → Todos los Viewers: { type: "play", timestamp: 45.2, sentAtUnixMs: ... }
  Viewers: Ejecutan play en posición 45.2

Host ejecuta PAUSE:
  Host → Server: { type: "pause", timestamp: 67.8 }
  Server → Todos los Viewers: { type: "pause", timestamp: 67.8 }
  Viewers: Ejecutan pause

Host cambia posición (SEEK):
  Host → Server: { type: "seek", timestamp: 120.0 }
  Server → Todos los Viewers: { type: "seek", timestamp: 120.0 }
  Viewers: Saltan a posición 120.0
```

### 5. Cola de Videos

```
Agregar video:
  Host → POST /api/videoqueue/{roomId} → QueueItem creado
       → WebSocket broadcast: "queue_updated"

Cambiar video actual:
  Host → WebSocket: { type: "change_video", videoUrl: "...", provider: "youtube" }
       → Server actualiza VideoState
       → Broadcast a todos los usuarios
```

---

## Modelos de Datos

### User (Base de datos)
```csharp
{
  Id: int,
  Username: string (único, max 50),
  Email: string (único, max 100),
  PasswordHash: string,
  CreatedAt: DateTime,
  LastLoginAt: DateTime
}
```

### Room (En memoria)
```csharp
{
  RoomId: string,
  HostId: string,
  VideoState: {
    VideoUrl: string,
    CurrentTime: double,
    IsPlaying: bool,
    Provider: string,      // "file", "url", "youtube"
    VideoId: string        // Para YouTube
  },
  Connections: Dictionary<sessionId, WebSocket>,
  Usernames: Dictionary<sessionId, username>,
  Queue: VideoQueue
}
```

### QueueItem
```csharp
{
  ItemId: string (GUID),
  VideoUrl: string,
  VideoFileName: string,
  Provider: string,
  Title: string,
  ScheduleType: string,    // "immediate", "absolute", "relative_time", "relative_count"
  ScheduledAtUtc: DateTime,
  AddedByUserId: string
}
```

---

## API REST Endpoints

### Autenticación
| Método | Endpoint | Descripción |
|--------|----------|-------------|
| POST | `/api/auth/register` | Registrar usuario |
| POST | `/api/auth/login` | Iniciar sesión |
| GET | `/api/auth/me` | Obtener usuario actual |

### Salas
| Método | Endpoint | Descripción |
|--------|----------|-------------|
| POST | `/api/rooms/create` | Crear sala |
| GET | `/api/rooms/public` | Listar salas públicas |
| GET | `/api/rooms/friends` | Listar salas de amigos |
| GET | `/api/rooms/{code}/can-join` | Verificar acceso |

### Amigos
| Método | Endpoint | Descripción |
|--------|----------|-------------|
| POST | `/api/friends/request` | Enviar solicitud |
| POST | `/api/friends/accept/{id}` | Aceptar solicitud |
| POST | `/api/friends/reject/{id}` | Rechazar solicitud |
| GET | `/api/friends` | Listar amigos |
| GET | `/api/friends/requests` | Solicitudes pendientes |

### Cola de Videos
| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/api/videoqueue/{roomId}` | Obtener cola |
| POST | `/api/videoqueue/{roomId}` | Agregar a cola |
| DELETE | `/api/videoqueue/{roomId}/{itemId}` | Eliminar de cola |
| PUT | `/api/videoqueue/{roomId}/reorder` | Reordenar cola |

### Videos
| Método | Endpoint | Descripción |
|--------|----------|-------------|
| POST | `/upload/{roomId}` | Subir video (solo host) |
| GET | `/videos/{roomId}/{fileName}` | Obtener video |
| GET | `/videos/{roomId}` | Listar videos |

---

## Mensajes WebSocket

### Cliente → Servidor
| Tipo | Descripción | Solo Host |
|------|-------------|-----------|
| `play` | Iniciar reproducción | Sí |
| `pause` | Pausar reproducción | Sí |
| `seek` | Cambiar posición | Sí |
| `change_video` | Cambiar video | Sí |
| `sync_request` | Solicitar sincronización | No |
| `chat` | Enviar mensaje de chat | No |

### Servidor → Cliente
| Tipo | Descripción |
|------|-------------|
| `welcome` | Confirmación de conexión |
| `room_state` | Estado de la sala y participantes |
| `video_ready` | Video disponible para reproducir |
| `user_joined` | Usuario se unió |
| `user_left` | Usuario se fue |
| `play` | Comando de reproducción |
| `pause` | Comando de pausa |
| `seek` | Comando de cambio de posición |
| `video_changed` | Video cambiado |
| `queue_updated` | Cola actualizada |
| `host_changed` | Nuevo host asignado |

---

## Seguridad

### Autenticación JWT
- **Algoritmo:** HS256
- **Duración:** 7 días
- **Validación:** Issuer, Audience, Lifetime, SigningKey

### CORS
- Orígenes permitidos configurables via `WATCHPARTY_FRONTEND_ORIGIN`
- Soporte para localhost en desarrollo

### Validaciones
- Session keys por conexión WebSocket
- Verificación de rol de host para comandos críticos
- Validación de extensiones de archivo (.mp4, .webm, .ogg, .mov)
- Límite de tamaño de archivo: 200 MB
- Protección contra path traversal

---

## Servicios en Background

### QueueSchedulerService
- **Frecuencia:** Cada minuto
- **Función:** Detecta videos programados cuya hora llegó y los reproduce automáticamente

### VideoStorageCleanupService
- **Frecuencia:** Configurable (default: cada 60 minutos)
- **Función:** Elimina videos con más de 24 horas de antigüedad

---

## Integraciones Externas

### YouTube
- Reproducción de videos mediante YouTube IFrame API
- Búsqueda de videos (via SOAP)

### Google Chromecast
- Servicio `CastService` en frontend
- Transmisión de video a dispositivos Chromecast

### Apple AirPlay
- Servicio `AirPlayService` en frontend
- Compatible con Safari y dispositivos iOS

### SOAP Legacy
- Endpoint `/soap` para operaciones legacy
- Soporta: Register, Login, GetFriends, CreateRoom, etc.

---

## Despliegue

### Variables de Entorno
```
DATABASE_URL                              # Connection string PostgreSQL
JWT_SECRET                                # Secreto JWT (mín 32 caracteres)
PORT                                      # Puerto del servidor (default: 8080)
WATCHPARTY_FRONTEND_ORIGIN                # Origen CORS permitido
WATCHPARTY_VIDEO_STORAGE                  # Ruta de almacenamiento
WATCHPARTY_VIDEO_CLEANUP_INTERVAL_MINUTES # Intervalo de limpieza
WATCHPARTY_VIDEO_MAX_AGE_HOURS            # Edad máxima de videos
```

### Docker
```bash
docker build -t watchpartyweb .
docker run -p 8080:8080 \
  -e DATABASE_URL="Host=...;Database=...;Username=...;Password=..." \
  -e JWT_SECRET="tu-secreto-de-32-caracteres-minimo" \
  watchpartyweb
```

---

## Estadísticas del Proyecto

| Métrica | Valor |
|---------|-------|
| Endpoints REST | 20+ |
| Operaciones WebSocket | 12 |
| Componentes Angular | 7 |
| Servicios Frontend | 12 |
| Modelos de datos | 10 |
| Operaciones SOAP | 13 |
