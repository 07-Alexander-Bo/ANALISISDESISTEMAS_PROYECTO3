-- CreateEnum
CREATE TYPE "EstadoFamilia" AS ENUM ('ACTIVA', 'SUSPENDIDA', 'INACTIVA');
CREATE TYPE "EstadoDistribucion" AS ENUM ('PROGRAMADA', 'EN_CURSO', 'COMPLETADA', 'CANCELADA');
CREATE TYPE "EstadoPago" AS ENUM ('PENDIENTE', 'PAGADO', 'VENCIDO', 'ANULADO');
CREATE TYPE "EstadoIncidencia" AS ENUM ('ABIERTA', 'EN_PROCESO', 'RESUELTA', 'CERRADA');
CREATE TYPE "EstadoNotificacion" AS ENUM ('PENDIENTE', 'ENVIADA', 'FALLIDA', 'LEIDA');
CREATE TYPE "RolUsuario" AS ENUM ('ADMIN', 'OPERADOR', 'TESORERO', 'TECNICO');

-- CreateTable
CREATE TABLE "Sector" (
    "id_sector" SERIAL NOT NULL,
    "nombre" VARCHAR(100) NOT NULL,
    "descripcion" TEXT,
    "prioridad" INTEGER NOT NULL DEFAULT 1,
    CONSTRAINT "Sector_pkey" PRIMARY KEY ("id_sector")
);
CREATE UNIQUE INDEX "Sector_nombre_key" ON "Sector"("nombre");

-- CreateTable
CREATE TABLE "Familia" (
    "id_familia" SERIAL NOT NULL,
    "nombre_responsable" VARCHAR(150) NOT NULL,
    "direccion" VARCHAR(255) NOT NULL,
    "telefono" VARCHAR(20),
    "estado" "EstadoFamilia" NOT NULL DEFAULT 'ACTIVA',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Familia_pkey" PRIMARY KEY ("id_familia")
);

-- CreateTable
CREATE TABLE "FamiliaSector" (
    "id" SERIAL NOT NULL,
    "id_familia" INTEGER NOT NULL,
    "id_sector" INTEGER NOT NULL,
    "fecha_asignacion" DATE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "FamiliaSector_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "FamiliaSector_id_familia_id_sector_key" ON "FamiliaSector"("id_familia", "id_sector");

-- CreateTable
CREATE TABLE "Tanque" (
    "id_tanque" SERIAL NOT NULL,
    "capacidad" DECIMAL(12,2) NOT NULL,
    "nivel_actual" DECIMAL(12,2) NOT NULL DEFAULT 0,
    CONSTRAINT "Tanque_pkey" PRIMARY KEY ("id_tanque")
);

-- CreateTable
CREATE TABLE "HistorialTanque" (
    "id_historial" SERIAL NOT NULL,
    "id_tanque" INTEGER NOT NULL,
    "nivel" DECIMAL(12,2) NOT NULL,
    "fecha" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "HistorialTanque_pkey" PRIMARY KEY ("id_historial")
);

-- CreateTable
CREATE TABLE "Distribucion" (
    "id_distribucion" SERIAL NOT NULL,
    "id_sector" INTEGER NOT NULL,
    "id_tanque" INTEGER NOT NULL,
    "fecha" DATE NOT NULL,
    "hora_inicio" VARCHAR(5) NOT NULL,
    "hora_fin" VARCHAR(5) NOT NULL,
    "estado" "EstadoDistribucion" NOT NULL DEFAULT 'PROGRAMADA',
    CONSTRAINT "Distribucion_pkey" PRIMARY KEY ("id_distribucion")
);

-- CreateTable
CREATE TABLE "Usuario" (
    "id_usuario" SERIAL NOT NULL,
    "nombre" VARCHAR(150) NOT NULL,
    "username" VARCHAR(80) NOT NULL,
    "password" VARCHAR(255) NOT NULL,
    "rol" "RolUsuario" NOT NULL DEFAULT 'OPERADOR',
    "activo" BOOLEAN NOT NULL DEFAULT true,
    CONSTRAINT "Usuario_pkey" PRIMARY KEY ("id_usuario")
);
CREATE UNIQUE INDEX "Usuario_username_key" ON "Usuario"("username");

-- CreateTable
CREATE TABLE "Pago" (
    "id_pago" SERIAL NOT NULL,
    "id_familia" INTEGER NOT NULL,
    "id_usuario" INTEGER NOT NULL,
    "fecha" DATE NOT NULL,
    "monto" DECIMAL(10,2) NOT NULL,
    "mes_correspondiente" VARCHAR(7) NOT NULL,
    "estado" "EstadoPago" NOT NULL DEFAULT 'PAGADO',
    CONSTRAINT "Pago_pkey" PRIMARY KEY ("id_pago")
);
CREATE UNIQUE INDEX "Pago_id_familia_mes_correspondiente_key" ON "Pago"("id_familia", "mes_correspondiente");

-- CreateTable
CREATE TABLE "Incidencia" (
    "id_incidencia" SERIAL NOT NULL,
    "id_familia" INTEGER,
    "tipo" VARCHAR(50) NOT NULL,
    "descripcion" TEXT NOT NULL,
    "fecha_reporte" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "estado" "EstadoIncidencia" NOT NULL DEFAULT 'ABIERTA',
    CONSTRAINT "Incidencia_pkey" PRIMARY KEY ("id_incidencia")
);

-- CreateTable
CREATE TABLE "Mantenimiento" (
    "id_mantenimiento" SERIAL NOT NULL,
    "id_incidencia" INTEGER,
    "id_usuario" INTEGER NOT NULL,
    "tipo" VARCHAR(50) NOT NULL,
    "descripcion" TEXT NOT NULL,
    "costo" DECIMAL(10,2) NOT NULL,
    "fecha" DATE NOT NULL,
    CONSTRAINT "Mantenimiento_pkey" PRIMARY KEY ("id_mantenimiento")
);

-- CreateTable
CREATE TABLE "Notificacion" (
    "id_notificacion" SERIAL NOT NULL,
    "id_usuario" INTEGER,
    "id_tanque" INTEGER,
    "mensaje" TEXT NOT NULL,
    "fecha" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "estado" "EstadoNotificacion" NOT NULL DEFAULT 'PENDIENTE',
    CONSTRAINT "Notificacion_pkey" PRIMARY KEY ("id_notificacion")
);

-- AddForeignKey
ALTER TABLE "FamiliaSector" ADD CONSTRAINT "FamiliaSector_id_familia_fkey" FOREIGN KEY ("id_familia") REFERENCES "Familia"("id_familia") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "FamiliaSector" ADD CONSTRAINT "FamiliaSector_id_sector_fkey" FOREIGN KEY ("id_sector") REFERENCES "Sector"("id_sector") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "HistorialTanque" ADD CONSTRAINT "HistorialTanque_id_tanque_fkey" FOREIGN KEY ("id_tanque") REFERENCES "Tanque"("id_tanque") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "Distribucion" ADD CONSTRAINT "Distribucion_id_sector_fkey" FOREIGN KEY ("id_sector") REFERENCES "Sector"("id_sector") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "Distribucion" ADD CONSTRAINT "Distribucion_id_tanque_fkey" FOREIGN KEY ("id_tanque") REFERENCES "Tanque"("id_tanque") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "Pago" ADD CONSTRAINT "Pago_id_familia_fkey" FOREIGN KEY ("id_familia") REFERENCES "Familia"("id_familia") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "Pago" ADD CONSTRAINT "Pago_id_usuario_fkey" FOREIGN KEY ("id_usuario") REFERENCES "Usuario"("id_usuario") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "Incidencia" ADD CONSTRAINT "Incidencia_id_familia_fkey" FOREIGN KEY ("id_familia") REFERENCES "Familia"("id_familia") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "Mantenimiento" ADD CONSTRAINT "Mantenimiento_id_incidencia_fkey" FOREIGN KEY ("id_incidencia") REFERENCES "Incidencia"("id_incidencia") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "Mantenimiento" ADD CONSTRAINT "Mantenimiento_id_usuario_fkey" FOREIGN KEY ("id_usuario") REFERENCES "Usuario"("id_usuario") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "Notificacion" ADD CONSTRAINT "Notificacion_id_usuario_fkey" FOREIGN KEY ("id_usuario") REFERENCES "Usuario"("id_usuario") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "Notificacion" ADD CONSTRAINT "Notificacion_id_tanque_fkey" FOREIGN KEY ("id_tanque") REFERENCES "Tanque"("id_tanque") ON DELETE SET NULL ON UPDATE CASCADE;
