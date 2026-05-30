const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding AquaControl database...');

  // Admin user
  const hash = await bcrypt.hash('Admin2026!', 12);
  await prisma.usuario.upsert({
    where: { username: 'admin' },
    update: {},
    create: { nombre: 'Administrador San Miguel', username: 'admin', password: hash, rol: 'ADMIN' }
  });

  // Demo users
  await prisma.usuario.upsert({
    where: { username: 'tesorero' },
    update: {},
    create: { nombre: 'María Elena García', username: 'tesorero', password: await bcrypt.hash('Tesorero2026!', 12), rol: 'TESORERO' }
  });
  await prisma.usuario.upsert({
    where: { username: 'tecnico' },
    update: {},
    create: { nombre: 'Roberto Mendoza', username: 'tecnico', password: await bcrypt.hash('Tecnico2026!', 12), rol: 'TECNICO' }
  });
  await prisma.usuario.upsert({
    where: { username: 'operador' },
    update: {},
    create: { nombre: 'Alejandro Torres', username: 'operador', password: await bcrypt.hash('Operador2026!', 12), rol: 'OPERADOR' }
  });

  // Sectores
  const sectores = [
    { nombre: 'Sector Norte', descripcion: 'Zona central con infraestructura de bombeo principal. 20 familias.', prioridad: 1 },
    { nombre: 'Sector Sur', descripcion: 'Distribución por gravedad. 40 familias.', prioridad: 2 },
    { nombre: 'Sector Este', descripcion: 'Alta densidad residencial. 40 familias.', prioridad: 3 },
    { nombre: 'Sector Oeste', descripcion: 'Zona rural con válvulas manuales. 10 familias.', prioridad: 4 },
    { nombre: 'Sector Periférico', descripcion: 'Zona de elevación con tanque de reserva. 10 familias.', prioridad: 5 },
  ];

  const sectorRecords = [];
  for (const s of sectores) {
    const sector = await prisma.sector.upsert({
      where: { nombre: s.nombre },
      update: {},
      create: s
    });
    sectorRecords.push(sector);
  }

  // Tanque principal
  const tanque = await prisma.tanque.upsert({
    where: { id_tanque: 1 },
    update: {},
    create: { id_tanque: 1, capacidad: 10000, nivel_actual: 7500 }
  });

  // Historial inicial del tanque
  await prisma.historialTanque.createMany({
    data: [
      { id_tanque: tanque.id_tanque, nivel: 8200, fecha: new Date('2026-05-01') },
      { id_tanque: tanque.id_tanque, nivel: 7900, fecha: new Date('2026-05-05') },
      { id_tanque: tanque.id_tanque, nivel: 7600, fecha: new Date('2026-05-10') },
      { id_tanque: tanque.id_tanque, nivel: 7500, fecha: new Date('2026-05-15') },
    ],
    skipDuplicates: true
  });

  // Familias de ejemplo
  const familiasData = [
    { nombre_responsable: 'González Rivera, Carlos', direccion: 'Calle Principal 12', telefono: '5551-0001' },
    { nombre_responsable: 'Ramírez Duarte, Ana', direccion: 'Avenida Central 45', telefono: '5551-0002' },
    { nombre_responsable: 'Soto Márquez, Pedro', direccion: 'Callejón Las Flores 7', telefono: '5551-0003' },
    { nombre_responsable: 'López García, María', direccion: 'Calle del Rio 22', telefono: '5551-0004' },
    { nombre_responsable: 'Pérez Solano, José', direccion: 'Barrio Norte 8', telefono: '5551-0005' },
    { nombre_responsable: 'Hernández Cruz, Elena', direccion: 'Calle Sur 15', telefono: '5551-0006' },
    { nombre_responsable: 'Mendoza Torres, Luis', direccion: 'Av. La Paz 33', telefono: '5551-0007' },
    { nombre_responsable: 'Fuentes Reyes, Rosa', direccion: 'Calle Este 9', telefono: '5551-0008' },
    { nombre_responsable: 'Castillo Vega, Mario', direccion: 'Callejón Nuevo 4', telefono: '5551-0009' },
    { nombre_responsable: 'Morales Jiménez, Carmen', direccion: 'Calle Oeste 17', telefono: '5551-0010' },
  ];

  // Distribute families across sectors
  for (let i = 0; i < familiasData.length; i++) {
    const f = familiasData[i];
    const sectorIdx = i % sectorRecords.length;
    const sector = sectorRecords[sectorIdx];

    const existing = await prisma.familia.findFirst({
      where: { nombre_responsable: f.nombre_responsable }
    });
    if (!existing) {
      await prisma.familia.create({
        data: {
          ...f,
          sectores: { create: { id_sector: sector.id_sector } }
        }
      });
    }
  }

  // Distribuciones de ejemplo
  await prisma.distribucion.createMany({
    data: [
      { id_sector: sectorRecords[0].id_sector, id_tanque: tanque.id_tanque, fecha: new Date('2026-05-20'), hora_inicio: '06:00', hora_fin: '09:00', estado: 'PROGRAMADA' },
      { id_sector: sectorRecords[1].id_sector, id_tanque: tanque.id_tanque, fecha: new Date('2026-05-20'), hora_inicio: '09:00', hora_fin: '12:00', estado: 'PROGRAMADA' },
      { id_sector: sectorRecords[2].id_sector, id_tanque: tanque.id_tanque, fecha: new Date('2026-05-20'), hora_inicio: '13:00', hora_fin: '16:00', estado: 'PROGRAMADA' },
    ],
    skipDuplicates: true
  });

  // Incidencias de ejemplo
  const fam1 = await prisma.familia.findFirst();
  await prisma.incidencia.createMany({
    data: [
      { tipo: 'FUGA', descripcion: 'Fuga visible en tubería secundaria frente a casa 12', estado: 'ABIERTA', id_familia: fam1?.id_familia },
      { tipo: 'AVERIA', descripcion: 'Bomba de presión hace ruido inusual', estado: 'EN_PROCESO' },
      { tipo: 'RECLAMO', descripcion: 'Baja presión de agua en Sector Este', estado: 'RESUELTA' },
    ],
    skipDuplicates: true
  });

  console.log('✅ Seed completado exitosamente');
  console.log('👤 Usuarios: admin/Admin2026! | tesorero/Tesorero2026! | tecnico/Tecnico2026! | operador/Operador2026!');
}

main()
  .catch(e => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
