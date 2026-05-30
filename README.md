# 💧 AquaControl v1.0.0
### Sistema de Gestión y Control del Agua — Comunidad Rural "San Miguel"
**Universidad Mariano Gálvez — Análisis de Sistemas I — 2026**

---

## 👥 Equipo
| Nombre | Carné | Rol |
|---|---|---|
| Eric Alexander Barillas Orozco | 7690-22-18539 | Product Owner |
| Hilton Alexander López Ic | 7690-13-20427 | Scrum Master |
| Edgar Esaú Contreras García | 7690-23-6131 | Desarrollador |

---

## 🚀 Inicio Rápido (Docker)

### Prerrequisitos
- Docker Desktop 24.0+ con Docker Compose v2
- Puertos libres: 3000, 4000, 5432

### Levantar el proyecto

```bash
# 1. Copiar variables de entorno
cp .env.example .env

# 2. Levantar todos los contenedores
docker compose up --build

# La primera vez tarda ~2 minutos (instala dependencias, migra BD, carga datos)
```

### Acceder
| Servicio | URL |
|---|---|
| Frontend (App) | http://localhost:3000 |
| API Backend | http://localhost:4000/api |
| Health check | http://localhost:4000/api/health |

### Usuarios de prueba
| Usuario | Contraseña | Rol |
|---|---|---|
| admin | Admin2026! | Administrador |
| tesorero | Tesorero2026! | Tesorero |
| tecnico | Tecnico2026! | Técnico |
| operador | Operador2026! | Operador |

---

## 🏗️ Arquitectura

```
aquacontrol/
├── docker-compose.yml       # Orquestación de contenedores
├── .env.example             # Variables de entorno (copiar a .env)
├── frontend/                # React 18 + Vite (sirve en puerto 3000)
│   ├── Dockerfile
│   ├── src/
│   │   ├── pages/           # Todas las vistas del sistema
│   │   ├── components/      # Componentes reutilizables
│   │   └── services/        # API client + AuthContext
│   └── ...
├── backend/                 # Node.js + Express (API en puerto 4000)
│   ├── Dockerfile
│   ├── entrypoint.sh        # Migra BD + seed + inicia servidor
│   ├── prisma/
│   │   ├── schema.prisma    # Modelo de datos
│   │   └── migrations/      # Migraciones SQL
│   └── src/
│       ├── routes/          # Endpoints REST por módulo
│       ├── middleware/      # Auth JWT + roles
│       └── index.js         # Entry point
└── nginx/
    └── nginx.conf           # Proxy reverso
```

### Stack Tecnológico
| Capa | Tecnología |
|---|---|
| Frontend | React 18, Vite, React Router v6 |
| Backend | Node.js 20, Express.js |
| Base de Datos | PostgreSQL 15 |
| ORM | Prisma |
| Autenticación | JWT + bcryptjs |
| Contenedores | Docker + Docker Compose |
| Servidor Web | Nginx |

---

## 📋 Módulos del Sistema

| Módulo | Descripción |
|---|---|
| 📊 Dashboard | Vista general: nivel tanque, incidencias abiertas, próximas distribuciones |
| 👨‍👩‍👧 Familias | CRUD de las 120 familias registradas |
| 🗺️ Sectores | Gestión de los 5 sectores de distribución |
| 🕐 Distribución | Programación de turnos con validación de traslapes |
| 💧 Almacenamiento | Nivel del tanque, historial, alertas críticas (<20%) |
| 💰 Aportes | Registro de pagos, detección de morosos, recibos |
| ⚠️ Incidencias | Reporte y seguimiento (ABIERTA → CERRADA) |
| 🔧 Mantenimiento | Registro de intervenciones preventivas/correctivas |
| 📄 Reportes | Reportes de pagos, incidencias y almacenamiento |
| 👤 Usuarios | Gestión de cuentas y roles (solo ADMIN) |

---

## 🛑 Detener el proyecto

```bash
docker compose down           # Detiene contenedores
docker compose down -v        # Detiene + elimina volumen de BD
```
