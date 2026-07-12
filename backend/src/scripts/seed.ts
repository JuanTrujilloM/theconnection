import 'dotenv/config';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '../generated/prisma/client';

// Comprehensive, realistic seed for end-to-end manual testing of the whole app:
// verified students (profiles + preferences + photos + interests), partner
// venues in Medellín and Bogotá, and matches across several weeks in every
// status (pending / confirmed / completed / canceled) with availabilities,
// venue options, dates, feedback and reports.
//
// Data mirrors the real vocabularies (auth/university-domains, profile/prefs
// constants) so seeded rows behave exactly like rows created through the UI.
// Deterministic ids + a full reset make it idempotent. DEV ONLY — it wipes the
// domain tables first.
//
// Usage:  npm run db:seed   (build + run)   — or   node dist/src/scripts/seed.js

// Relative-time helpers so "this week" / "3 weeks ago" stay correct whenever run.
const DAY = 24 * 60 * 60 * 1000;
const daysFromNow = (n: number): Date => new Date(Date.now() + n * DAY);
const daysAgo = (n: number): Date => new Date(Date.now() - n * DAY);

// Real portrait photos keep profiles lifelike; folder matches the gender.
const portrait = (folder: 'men' | 'women', n: number): string =>
  `https://randomuser.me/api/portraits/${folder}/${n}.jpg`;

export interface StudentSeed {
  key: string;
  name: string;
  email: string;
  cellphone: string;
  gender: 'Masculino' | 'Femenino' | 'No binario' | 'Prefiero no decir';
  dateOfBirth: string;
  height: number;
  biography: string;
  university: string;
  major: string;
  semester: string;
  status: 'SEARCHING' | 'PAUSED';
  photos: string[];
  hobbies: string[];
  preferences: {
    relationshipType: string;
    orientation: string;
    minAge: number;
    maxAge: number;
    genderInterest: 'Hombres' | 'Mujeres' | 'No binario' | 'Todos';
    sameUniversity: boolean;
    heightRange: string;
    energyVibe: string[];
  };
}

// Hobby catalog: { name -> category }. Names double as venue-tag overlap signal.
export const HOBBY_CATALOG: Record<string, string> = {
  'Música en vivo': 'Música',
  Salsa: 'Música',
  'Tocar guitarra': 'Música',
  Fútbol: 'Deporte',
  Running: 'Deporte',
  Ciclismo: 'Deporte',
  Gimnasio: 'Deporte',
  Tenis: 'Deporte',
  Natación: 'Deporte',
  Escalada: 'Deporte',
  Senderismo: 'Aire libre',
  Camping: 'Aire libre',
  Viajar: 'Aire libre',
  Fotografía: 'Arte',
  Pintura: 'Arte',
  Teatro: 'Arte',
  Cine: 'Arte',
  Series: 'Entretenimiento',
  Cocinar: 'Gastronomía',
  'Café de especialidad': 'Gastronomía',
  Repostería: 'Gastronomía',
  'Cata de vinos': 'Gastronomía',
  Lectura: 'Académico',
  Escritura: 'Académico',
  Idiomas: 'Académico',
  Ajedrez: 'Académico',
  Astronomía: 'Académico',
  Videojuegos: 'Tecnología',
  Programación: 'Tecnología',
  Robótica: 'Tecnología',
  Yoga: 'Bienestar',
  Meditación: 'Bienestar',
  Baile: 'Bienestar',
  Voluntariado: 'Social',
  Emprendimiento: 'Social',
  Mascotas: 'Social',
};

// Partner venues with real neighborhoods/addresses; tags (lowercase, Spanish)
// overlap hobby names to give HU-06 ranking signal. Amounts in COP.
export const VENUES = [
  {
    id: 'venue-pergamino',
    name: 'Pergamino Café',
    type: 'Café',
    address: 'Cra. 37 #8A-37, El Poblado, Medellín',
    openingHours: 'Lun-Sáb 7:00-21:00, Dom 9:00-18:00',
    description: 'Café de especialidad ideal para conversar sin afán.',
    commissionRate: 0.1,
    averageSpentPerPerson: 28000,
    tags: ['café de especialidad', 'café', 'lectura'],
  },
  {
    id: 'venue-velvet',
    name: 'Café Velvet',
    type: 'Café',
    address: 'Cra. 33 #7-26, El Poblado, Medellín',
    openingHours: 'Lun-Dom 8:00-22:00',
    description: 'Café tranquilo y acogedor, perfecto para una primera cita.',
    commissionRate: 0.12,
    averageSpentPerPerson: 32000,
    tags: ['café', 'lectura', 'tranquilo'],
  },
  {
    id: 'venue-alalma',
    name: 'Al Alma Café',
    type: 'Café',
    address: 'Cra. 34 #7-109, El Poblado, Medellín',
    openingHours: 'Lun-Dom 8:00-20:00',
    description: 'Terraza verde y brunch para una mañana relajada.',
    commissionRate: 0.11,
    averageSpentPerPerson: 34000,
    tags: ['café', 'brunch', 'cocinar'],
  },
  {
    id: 'venue-cine-tesoro',
    name: 'Cine Colombia El Tesoro',
    type: 'Cine',
    address: 'CC El Tesoro, Cra. 25A #1A Sur-45, El Poblado, Medellín',
    openingHours: 'Lun-Dom 12:00-22:00',
    description: 'Salas de cine para ver el estreno del momento.',
    commissionRate: 0.08,
    averageSpentPerPerson: 30000,
    tags: ['cine', 'series', 'películas'],
  },
  {
    id: 'venue-crepes-vegas',
    name: 'Crepes & Waffles Las Vegas',
    type: 'Restaurante',
    address: 'Av. Las Vegas #2 Sur-72, El Poblado, Medellín',
    openingHours: 'Lun-Dom 12:00-22:00',
    description: 'Crepes dulces y saladas en un ambiente relajado.',
    commissionRate: 0.1,
    averageSpentPerPerson: 40000,
    tags: ['cocinar', 'repostería', 'cena'],
  },
  {
    id: 'venue-presidenta',
    name: 'Parque de la Presidenta',
    type: 'Parque',
    address: 'Cra. 43A con Cl. 11A, El Poblado, Medellín',
    openingHours: 'Lun-Dom 6:00-18:00',
    description: 'Parque al aire libre para caminar y compartir un picnic.',
    commissionRate: 0,
    averageSpentPerPerson: 15000,
    tags: ['senderismo', 'aire libre', 'mascotas'],
  },
  {
    id: 'venue-mercado-rio',
    name: 'Mercado del Río',
    type: 'Restaurante',
    address: 'Cl. 24 #48-28, Ciudad del Río, Medellín',
    openingHours: 'Lun-Dom 11:00-23:00',
    description: 'Plaza gastronómica con decenas de cocinas para elegir.',
    commissionRate: 0.09,
    averageSpentPerPerson: 45000,
    tags: ['cocinar', 'música en vivo', 'cena'],
  },
  {
    id: 'venue-mamm',
    name: 'Museo de Arte Moderno (MAMM)',
    type: 'Museo',
    address: 'Cra. 44 #19A-100, Ciudad del Río, Medellín',
    openingHours: 'Mar-Dom 10:00-18:00',
    description: 'Exposiciones de arte contemporáneo y café en el lobby.',
    commissionRate: 0.07,
    averageSpentPerPerson: 22000,
    tags: ['pintura', 'arte', 'cine'],
  },
  {
    id: 'venue-laureles-bowling',
    name: 'Bolos Club El Rodeo',
    type: 'Entretenimiento',
    address: 'Cl. 44 #79-40, Laureles, Medellín',
    openingHours: 'Lun-Dom 14:00-23:00',
    description: 'Bolera y juegos para romper el hielo con una actividad.',
    commissionRate: 0.1,
    averageSpentPerPerson: 38000,
    tags: ['videojuegos', 'juegos', 'diversión'],
  },
  {
    id: 'venue-envigado-cervezas',
    name: 'Cervecería Libre',
    type: 'Bar',
    address: 'Cl. 37 Sur #41-25, Envigado, Medellín',
    openingHours: 'Mié-Sáb 16:00-1:00',
    description: 'Cervezas artesanales locales y música en vivo los viernes.',
    commissionRate: 0.13,
    averageSpentPerPerson: 42000,
    tags: ['cata de vinos', 'música en vivo', 'salsa'],
  },
  {
    id: 'venue-sanalberto-bog',
    name: 'Café San Alberto Zona T',
    type: 'Café',
    address: 'Cl. 82 #12-16, Chapinero, Bogotá',
    openingHours: 'Lun-Dom 8:00-21:00',
    description: 'Café colombiano premiado, para una cita con aroma a origen.',
    commissionRate: 0.11,
    averageSpentPerPerson: 30000,
    tags: ['café de especialidad', 'café', 'lectura'],
  },
  {
    id: 'venue-parque93-bog',
    name: 'Parque de la 93',
    type: 'Parque',
    address: 'Cl. 93 con Cra. 13, Chicó, Bogotá',
    openingHours: 'Lun-Dom 6:00-22:00',
    description: 'Parque rodeado de restaurantes para caminar y conversar.',
    commissionRate: 0,
    averageSpentPerPerson: 18000,
    tags: ['senderismo', 'aire libre', 'mascotas'],
  },
  {
    id: 'venue-andino-crepes-bog',
    name: 'Crepes & Waffles Andino',
    type: 'Restaurante',
    address: 'Cra. 11 #82-71, CC Andino, Bogotá',
    openingHours: 'Lun-Dom 12:00-22:00',
    description: 'Clásico para una cita: crepes, postres y buen ambiente.',
    commissionRate: 0.1,
    averageSpentPerPerson: 41000,
    tags: ['cocinar', 'repostería', 'cena'],
  },
  {
    id: 'venue-libelula-bog',
    name: 'Libélula Books & Coffee',
    type: 'Café',
    address: 'Cra. 4 #57-58, Chapinero Alto, Bogotá',
    openingHours: 'Lun-Sáb 9:00-20:00',
    description: 'Librería-café ideal para amantes de la lectura.',
    commissionRate: 0.12,
    averageSpentPerPerson: 27000,
    tags: ['lectura', 'café', 'escritura'],
  },
];

// 24 students across the supported universities, with orientations/interests
// designed so the matcher finds mutually-compatible pairs (hetero, gay,
// lesbian, bi, non-binary). email domain always matches `university`.
export const STUDENTS: StudentSeed[] = [
  // --- EAFIT ---
  {
    key: 'valentina',
    name: 'Valentina Ríos',
    email: 'valentina.rios@eafit.edu.co',
    cellphone: '+573001000001',
    gender: 'Femenino',
    dateOfBirth: '2003-04-12',
    height: 166,
    biography: 'Estudiante de Derecho, amante del café y el cine europeo.',
    university: 'EAFIT',
    major: 'Derecho',
    semester: '6',
    status: 'SEARCHING',
    photos: [portrait('women', 1), portrait('women', 21)],
    hobbies: ['Café de especialidad', 'Cine', 'Lectura', 'Viajar'],
    preferences: {
      relationshipType: 'Seria',
      orientation: 'Heterosexual',
      minAge: 21,
      maxAge: 28,
      genderInterest: 'Hombres',
      sameUniversity: false,
      heightRange: 'Más alta',
      energyVibe: ['Tranquilo/a', 'Romántico/a'],
    },
  },
  {
    key: 'santiago',
    name: 'Santiago Gómez',
    email: 'santiago.gomez@eafit.edu.co',
    cellphone: '+573001000002',
    gender: 'Masculino',
    dateOfBirth: '2001-09-05',
    height: 182,
    biography: 'Ingeniero en formación, corro los domingos y amo el café.',
    university: 'EAFIT',
    major: 'Ingeniería de Sistemas',
    semester: '8',
    status: 'SEARCHING',
    photos: [portrait('men', 11), portrait('men', 31)],
    hobbies: ['Running', 'Café de especialidad', 'Programación', 'Cine'],
    preferences: {
      relationshipType: 'Seria',
      orientation: 'Heterosexual',
      minAge: 20,
      maxAge: 26,
      genderInterest: 'Mujeres',
      sameUniversity: false,
      heightRange: 'Indiferente',
      energyVibe: ['Tranquilo/a', 'Ambicioso/a'],
    },
  },
  {
    key: 'laura',
    name: 'Laura Restrepo',
    email: 'laura.restrepo@eafit.edu.co',
    cellphone: '+573001000003',
    gender: 'Femenino',
    dateOfBirth: '2002-11-23',
    height: 170,
    biography: 'Economía de día, repostería de noche. Busco planes tranquilos.',
    university: 'EAFIT',
    major: 'Economía',
    semester: '7',
    status: 'PAUSED',
    photos: [portrait('women', 5)],
    hobbies: ['Repostería', 'Cocinar', 'Series', 'Yoga'],
    preferences: {
      relationshipType: 'Casual abierto a seria',
      orientation: 'Heterosexual',
      minAge: 21,
      maxAge: 29,
      genderInterest: 'Hombres',
      sameUniversity: false,
      heightRange: 'Similar',
      energyVibe: ['Tranquilo/a', 'Creativo/a'],
    },
  },
  {
    key: 'andres',
    name: 'Andrés Vélez',
    email: 'andres.velez@eafit.edu.co',
    cellphone: '+573001000004',
    gender: 'Masculino',
    dateOfBirth: '2003-02-14',
    height: 178,
    biography: 'Negocios internacionales. Viajero, fotógrafo aficionado.',
    university: 'EAFIT',
    major: 'Negocios Internacionales',
    semester: '5',
    status: 'SEARCHING',
    photos: [portrait('men', 15), portrait('men', 44)],
    hobbies: ['Viajar', 'Fotografía', 'Idiomas', 'Café de especialidad'],
    preferences: {
      relationshipType: 'Abierto a todo',
      orientation: 'Heterosexual',
      minAge: 19,
      maxAge: 26,
      genderInterest: 'Mujeres',
      sameUniversity: false,
      heightRange: 'Indiferente',
      energyVibe: ['Aventurero/a', 'Extrovertido/a'],
    },
  },
  {
    key: 'felipe',
    name: 'Felipe Cardona',
    email: 'felipe.cardona@eafit.edu.co',
    cellphone: '+573001000005',
    gender: 'Masculino',
    dateOfBirth: '2002-06-30',
    height: 176,
    biography:
      'Música, teatro y buenas conversaciones. Diseño mi propia marca.',
    university: 'EAFIT',
    major: 'Música',
    semester: '9',
    status: 'SEARCHING',
    photos: [portrait('men', 22), portrait('men', 52)],
    hobbies: ['Música en vivo', 'Teatro', 'Tocar guitarra', 'Emprendimiento'],
    preferences: {
      relationshipType: 'Seria',
      orientation: 'Gay',
      minAge: 21,
      maxAge: 30,
      genderInterest: 'Hombres',
      sameUniversity: false,
      heightRange: 'Indiferente',
      energyVibe: ['Creativo/a', 'Romántico/a'],
    },
  },
  {
    key: 'juliana',
    name: 'Juliana Mesa',
    email: 'juliana.mesa@eafit.edu.co',
    cellphone: '+573001000006',
    gender: 'Femenino',
    dateOfBirth: '2004-01-19',
    height: 163,
    biography: 'Bio y naturaleza. Me encontrarás en un sendero o con un libro.',
    university: 'EAFIT',
    major: 'Biología',
    semester: '4',
    status: 'SEARCHING',
    photos: [portrait('women', 8), portrait('women', 33)],
    hobbies: ['Senderismo', 'Lectura', 'Astronomía', 'Mascotas'],
    preferences: {
      relationshipType: 'Seria abierta a casual',
      orientation: 'Bisexual',
      minAge: 19,
      maxAge: 27,
      genderInterest: 'Todos',
      sameUniversity: false,
      heightRange: 'Indiferente',
      energyVibe: ['Tranquilo/a', 'Aventurero/a'],
    },
  },
  {
    key: 'ariel',
    name: 'Ariel Quintero',
    email: 'ariel.quintero@eafit.edu.co',
    cellphone: '+573001000007',
    gender: 'No binario',
    dateOfBirth: '2003-08-08',
    height: 172,
    biography: 'Arte digital y videojuegos. Creativo/a y curioso/a por todo.',
    university: 'EAFIT',
    major: 'Comunicación Social',
    semester: '6',
    status: 'SEARCHING',
    photos: [portrait('men', 60)],
    hobbies: ['Videojuegos', 'Pintura', 'Cine', 'Música en vivo'],
    preferences: {
      relationshipType: 'Abierto a todo',
      orientation: 'Otro',
      minAge: 19,
      maxAge: 28,
      genderInterest: 'Todos',
      sameUniversity: false,
      heightRange: 'Indiferente',
      energyVibe: ['Creativo/a', 'Introvertido/a'],
    },
  },
  // --- CES ---
  {
    key: 'isabella',
    name: 'Isabella Naranjo',
    email: 'isabella.naranjo@ces.edu.co',
    cellphone: '+573001000008',
    gender: 'Femenino',
    dateOfBirth: '2002-03-27',
    height: 168,
    biography: 'Medicina y maratones. Disciplina de día, series de noche.',
    university: 'CES',
    major: 'Medicina',
    semester: '8',
    status: 'SEARCHING',
    photos: [portrait('women', 12), portrait('women', 40)],
    hobbies: ['Running', 'Series', 'Natación', 'Café de especialidad'],
    preferences: {
      relationshipType: 'Seria',
      orientation: 'Heterosexual',
      minAge: 22,
      maxAge: 30,
      genderInterest: 'Hombres',
      sameUniversity: false,
      heightRange: 'Más alta',
      energyVibe: ['Ambicioso/a', 'Tranquilo/a'],
    },
  },
  {
    key: 'samuel',
    name: 'Samuel Ospina',
    email: 'samuel.ospina@ces.edu.co',
    cellphone: '+573001000009',
    gender: 'Masculino',
    dateOfBirth: '2001-12-02',
    height: 180,
    biography: 'Odontología. Ciclista de fin de semana y fan del buen café.',
    university: 'CES',
    major: 'Odontología',
    semester: '9',
    status: 'SEARCHING',
    photos: [portrait('men', 3), portrait('men', 36)],
    hobbies: ['Ciclismo', 'Café de especialidad', 'Cocinar', 'Viajar'],
    preferences: {
      relationshipType: 'Casual abierto a seria',
      orientation: 'Heterosexual',
      minAge: 20,
      maxAge: 27,
      genderInterest: 'Mujeres',
      sameUniversity: false,
      heightRange: 'Indiferente',
      energyVibe: ['Aventurero/a', 'Tranquilo/a'],
    },
  },
  {
    key: 'miguel',
    name: 'Miguel Ángel Torres',
    email: 'miguel.torres@ces.edu.co',
    cellphone: '+573001000010',
    gender: 'Masculino',
    dateOfBirth: '2002-07-15',
    height: 179,
    biography: 'Psicología. Teatro, cine club y largas caminatas al atardecer.',
    university: 'CES',
    major: 'Psicología',
    semester: '7',
    status: 'SEARCHING',
    photos: [portrait('men', 24), portrait('men', 54)],
    hobbies: ['Teatro', 'Cine', 'Senderismo', 'Lectura'],
    preferences: {
      relationshipType: 'Seria',
      orientation: 'Gay',
      minAge: 21,
      maxAge: 29,
      genderInterest: 'Hombres',
      sameUniversity: false,
      heightRange: 'Indiferente',
      energyVibe: ['Romántico/a', 'Creativo/a'],
    },
  },
  // --- UPB ---
  {
    key: 'mariana',
    name: 'Mariana Álvarez',
    email: 'mariana.alvarez@upb.edu.co',
    cellphone: '+573001000011',
    gender: 'Femenino',
    dateOfBirth: '2003-05-18',
    height: 167,
    biography: 'Arquitectura y acuarela. Amo los cafés con buena luz.',
    university: 'UPB',
    major: 'Arquitectura',
    semester: '6',
    status: 'SEARCHING',
    photos: [portrait('women', 16), portrait('women', 45)],
    hobbies: ['Pintura', 'Café de especialidad', 'Fotografía', 'Viajar'],
    preferences: {
      relationshipType: 'Seria',
      orientation: 'Heterosexual',
      minAge: 21,
      maxAge: 28,
      genderInterest: 'Hombres',
      sameUniversity: false,
      heightRange: 'Más alta',
      energyVibe: ['Creativo/a', 'Tranquilo/a'],
    },
  },
  {
    key: 'mateo',
    name: 'Mateo Jaramillo',
    email: 'mateo.jaramillo@upb.edu.co',
    cellphone: '+573001000012',
    gender: 'Masculino',
    dateOfBirth: '2002-10-09',
    height: 183,
    biography: 'Ingeniería industrial. Fútbol, asados y planes espontáneos.',
    university: 'UPB',
    major: 'Ingeniería Industrial',
    semester: '7',
    status: 'SEARCHING',
    photos: [portrait('men', 7), portrait('men', 41)],
    hobbies: ['Fútbol', 'Cocinar', 'Videojuegos', 'Música en vivo'],
    preferences: {
      relationshipType: 'Casual',
      orientation: 'Heterosexual',
      minAge: 19,
      maxAge: 26,
      genderInterest: 'Mujeres',
      sameUniversity: false,
      heightRange: 'Indiferente',
      energyVibe: ['Extrovertido/a', 'Espontáneo/a'],
    },
  },
  {
    key: 'sara',
    name: 'Sara Betancur',
    email: 'sara.betancur@upb.edu.co',
    cellphone: '+573001000013',
    gender: 'Femenino',
    dateOfBirth: '2003-09-21',
    height: 165,
    biography: 'Diseño industrial. Vinilos, plantas y buena conversación.',
    university: 'UPB',
    major: 'Diseño Industrial',
    semester: '5',
    status: 'SEARCHING',
    photos: [portrait('women', 20), portrait('women', 50)],
    hobbies: ['Pintura', 'Música en vivo', 'Mascotas', 'Cocinar'],
    preferences: {
      relationshipType: 'Seria',
      orientation: 'Lesbiana',
      minAge: 20,
      maxAge: 28,
      genderInterest: 'Mujeres',
      sameUniversity: false,
      heightRange: 'Indiferente',
      energyVibe: ['Creativo/a', 'Tranquilo/a'],
    },
  },
  // --- EIA ---
  {
    key: 'sofia',
    name: 'Sofía Palacio',
    email: 'sofia.palacio@eia.edu.co',
    cellphone: '+573001000014',
    gender: 'Femenino',
    dateOfBirth: '2002-08-11',
    height: 169,
    biography: 'Ingeniería biomédica. Yoga, senderismo y ciencia ficción.',
    university: 'EIA',
    major: 'Ingeniería Biomédica',
    semester: '8',
    status: 'SEARCHING',
    photos: [portrait('women', 23), portrait('women', 55)],
    hobbies: ['Yoga', 'Senderismo', 'Lectura', 'Astronomía'],
    preferences: {
      relationshipType: 'Seria',
      orientation: 'Heterosexual',
      minAge: 21,
      maxAge: 29,
      genderInterest: 'Hombres',
      sameUniversity: false,
      heightRange: 'Similar',
      energyVibe: ['Tranquilo/a', 'Ambicioso/a'],
    },
  },
  {
    key: 'nicolas',
    name: 'Nicolás Arango',
    email: 'nicolas.arango@eia.edu.co',
    cellphone: '+573001000015',
    gender: 'Masculino',
    dateOfBirth: '2001-04-03',
    height: 181,
    biography: 'Ingeniería civil. Escalada, camping y astronomía los findes.',
    university: 'EIA',
    major: 'Ingeniería Civil',
    semester: '9',
    status: 'SEARCHING',
    photos: [portrait('men', 18), portrait('men', 48)],
    hobbies: ['Escalada', 'Camping', 'Astronomía', 'Senderismo'],
    preferences: {
      relationshipType: 'Seria',
      orientation: 'Heterosexual',
      minAge: 20,
      maxAge: 28,
      genderInterest: 'Mujeres',
      sameUniversity: false,
      heightRange: 'Indiferente',
      energyVibe: ['Aventurero/a', 'Tranquilo/a'],
    },
  },
  {
    key: 'manuela',
    name: 'Manuela Zapata',
    email: 'manuela.zapata@eia.edu.co',
    cellphone: '+573001000016',
    gender: 'Femenino',
    dateOfBirth: '2003-12-30',
    height: 164,
    biography: 'Ingeniería administrativa. Salsa, café y planes al aire libre.',
    university: 'EIA',
    major: 'Ingeniería Administrativa',
    semester: '6',
    status: 'SEARCHING',
    photos: [portrait('women', 26), portrait('women', 60)],
    hobbies: ['Salsa', 'Café de especialidad', 'Senderismo', 'Baile'],
    preferences: {
      relationshipType: 'Seria abierta a casual',
      orientation: 'Lesbiana',
      minAge: 20,
      maxAge: 28,
      genderInterest: 'Mujeres',
      sameUniversity: false,
      heightRange: 'Indiferente',
      energyVibe: ['Extrovertido/a', 'Aventurero/a'],
    },
  },
  // --- Javeriana (Bogotá) ---
  {
    key: 'daniela',
    name: 'Daniela Moreno',
    email: 'daniela.moreno@javeriana.edu.co',
    cellphone: '+573001000017',
    gender: 'Femenino',
    dateOfBirth: '2002-02-06',
    height: 171,
    biography: 'Comunicación. Podcasts, museos y café en Chapinero.',
    university: 'Javeriana',
    major: 'Comunicación',
    semester: '7',
    status: 'SEARCHING',
    photos: [portrait('women', 29), portrait('women', 65)],
    hobbies: ['Café de especialidad', 'Escritura', 'Cine', 'Lectura'],
    preferences: {
      relationshipType: 'Seria',
      orientation: 'Heterosexual',
      minAge: 21,
      maxAge: 29,
      genderInterest: 'Hombres',
      sameUniversity: true,
      heightRange: 'Más alta',
      energyVibe: ['Creativo/a', 'Ambicioso/a'],
    },
  },
  {
    key: 'sebastian',
    name: 'Sebastián Rojas',
    email: 'sebastian.rojas@javeriana.edu.co',
    cellphone: '+573001000018',
    gender: 'Masculino',
    dateOfBirth: '2001-06-24',
    height: 184,
    biography: 'Derecho. Debate, ciclismo por la ciclovía y buen vino.',
    university: 'Javeriana',
    major: 'Derecho',
    semester: '9',
    status: 'SEARCHING',
    photos: [portrait('men', 26), portrait('men', 56)],
    hobbies: ['Ciclismo', 'Cata de vinos', 'Lectura', 'Idiomas'],
    preferences: {
      relationshipType: 'Seria',
      orientation: 'Heterosexual',
      minAge: 20,
      maxAge: 28,
      genderInterest: 'Mujeres',
      sameUniversity: true,
      heightRange: 'Indiferente',
      energyVibe: ['Ambicioso/a', 'Tranquilo/a'],
    },
  },
  // --- Uniandes (Bogotá) ---
  {
    key: 'camila',
    name: 'Camila Herrera',
    email: 'camila.herrera@uniandes.edu.co',
    cellphone: '+573001000019',
    gender: 'Femenino',
    dateOfBirth: '2003-03-14',
    height: 168,
    biography: 'Economía. Corro en el parque, cocino y colecciono vinilos.',
    university: 'Uniandes',
    major: 'Economía',
    semester: '6',
    status: 'SEARCHING',
    photos: [portrait('women', 31), portrait('women', 68)],
    hobbies: ['Running', 'Cocinar', 'Música en vivo', 'Café de especialidad'],
    preferences: {
      relationshipType: 'Casual abierto a seria',
      orientation: 'Heterosexual',
      minAge: 21,
      maxAge: 29,
      genderInterest: 'Hombres',
      sameUniversity: false,
      heightRange: 'Similar',
      energyVibe: ['Extrovertido/a', 'Ambicioso/a'],
    },
  },
  {
    key: 'tomas',
    name: 'Tomás Beltrán',
    email: 'tomas.beltran@uniandes.edu.co',
    cellphone: '+573001000020',
    gender: 'Masculino',
    dateOfBirth: '2002-01-28',
    height: 177,
    biography:
      'Ingeniería de sistemas. Gaming, ajedrez y planes de última hora.',
    university: 'Uniandes',
    major: 'Ingeniería de Sistemas',
    semester: '8',
    status: 'SEARCHING',
    photos: [portrait('men', 33), portrait('men', 63)],
    hobbies: ['Videojuegos', 'Ajedrez', 'Programación', 'Cine'],
    preferences: {
      relationshipType: 'Casual',
      orientation: 'Heterosexual',
      minAge: 19,
      maxAge: 27,
      genderInterest: 'Mujeres',
      sameUniversity: false,
      heightRange: 'Indiferente',
      energyVibe: ['Introvertido/a', 'Espontáneo/a'],
    },
  },
  {
    key: 'david',
    name: 'David Castaño',
    email: 'david.castano@uniandes.edu.co',
    cellphone: '+573001000021',
    gender: 'Masculino',
    dateOfBirth: '2003-07-07',
    height: 175,
    biography: 'Física. Astronomía, montañas y jazz en vivo los jueves.',
    university: 'Uniandes',
    major: 'Física',
    semester: '5',
    status: 'SEARCHING',
    photos: [portrait('men', 38), portrait('men', 68)],
    hobbies: ['Astronomía', 'Senderismo', 'Música en vivo', 'Lectura'],
    preferences: {
      relationshipType: 'Abierto a todo',
      orientation: 'Bisexual',
      minAge: 19,
      maxAge: 28,
      genderInterest: 'Todos',
      sameUniversity: false,
      heightRange: 'Indiferente',
      energyVibe: ['Tranquilo/a', 'Creativo/a'],
    },
  },
  {
    key: 'alex',
    name: 'Alex Duarte',
    email: 'alex.duarte@uniandes.edu.co',
    cellphone: '+573001000022',
    gender: 'Prefiero no decir',
    dateOfBirth: '2002-05-16',
    height: 173,
    biography: 'Administración. Voluntariado, café y buenos libros.',
    university: 'Uniandes',
    major: 'Administración',
    semester: '7',
    status: 'SEARCHING',
    photos: [portrait('men', 70)],
    hobbies: ['Voluntariado', 'Café de especialidad', 'Lectura', 'Idiomas'],
    preferences: {
      relationshipType: 'Amistad',
      orientation: 'Prefiero no decir',
      minAge: 20,
      maxAge: 30,
      genderInterest: 'Todos',
      sameUniversity: false,
      heightRange: 'Indiferente',
      energyVibe: ['Introvertido/a', 'Tranquilo/a'],
    },
  },
  // --- Rosario (Bogotá) ---
  {
    key: 'antonia',
    name: 'Antonia Lozano',
    email: 'antonia.lozano@urosario.edu.co',
    cellphone: '+573001000023',
    gender: 'Femenino',
    dateOfBirth: '2003-10-02',
    height: 166,
    biography: 'Relaciones internacionales. Idiomas, teatro y viajes.',
    university: 'Rosario',
    major: 'Relaciones Internacionales',
    semester: '6',
    status: 'SEARCHING',
    photos: [portrait('women', 39), portrait('women', 72)],
    hobbies: ['Idiomas', 'Teatro', 'Viajar', 'Escritura'],
    preferences: {
      relationshipType: 'Seria',
      orientation: 'Heterosexual',
      minAge: 21,
      maxAge: 29,
      genderInterest: 'Hombres',
      sameUniversity: false,
      heightRange: 'Más alta',
      energyVibe: ['Creativo/a', 'Extrovertido/a'],
    },
  },
  // --- Externado (Bogotá) ---
  {
    key: 'simon',
    name: 'Simón Prieto',
    email: 'simon.prieto@externado.edu.co',
    cellphone: '+573001000024',
    gender: 'Masculino',
    dateOfBirth: '2002-12-19',
    height: 179,
    biography: 'Finanzas. Tenis, emprendimiento y café los sábados.',
    university: 'Externado',
    major: 'Finanzas',
    semester: '8',
    status: 'SEARCHING',
    photos: [portrait('men', 43), portrait('men', 73)],
    hobbies: ['Tenis', 'Emprendimiento', 'Café de especialidad', 'Viajar'],
    preferences: {
      relationshipType: 'Seria',
      orientation: 'Heterosexual',
      minAge: 20,
      maxAge: 28,
      genderInterest: 'Mujeres',
      sameUniversity: false,
      heightRange: 'Indiferente',
      energyVibe: ['Ambicioso/a', 'Aventurero/a'],
    },
  },
];

// Match scenarios by student key. Each covers a real product state so the whole
// flow (HU-05..HU-10 + weekly matching history) is testable end to end.
export interface MatchSeed {
  id: string;
  a: string;
  b: string;
  compatibilityScore: number;
  status: 'pending' | 'confirmed' | 'completed' | 'canceled';
  createdAt: Date;
  // Selected venue ids per user (subset of venueOptionIds), for HU-06/07/08.
  venueOptionIds?: string[];
  aSelected?: string[];
  bSelected?: string[];
  // Availability slots (HU-09) both users share, for active matches.
  availability?: { date: Date; slots: string[] };
  // A scheduled/held date (HU-08) with per-user feedback (HU-10).
  date?: {
    venueId: string;
    scheduledAt: Date;
    status: 'confirmed' | 'completed' | 'canceled';
    feedback?: {
      user: string;
      occurred: boolean;
      rating?: number;
      comments?: string;
      noShowReason?: string;
      amountSpent?: number;
    }[];
  };
}

export const MATCHES: MatchSeed[] = [
  // 1) Confirmed match with an upcoming date this week (dashboard + chatbot).
  {
    id: 'match-conf-valentina-santiago',
    a: 'valentina',
    b: 'santiago',
    compatibilityScore: 9.1,
    status: 'confirmed',
    createdAt: daysAgo(2),
    venueOptionIds: ['venue-pergamino', 'venue-velvet', 'venue-mamm'],
    aSelected: ['venue-pergamino', 'venue-velvet'],
    bSelected: ['venue-pergamino', 'venue-mamm'],
    availability: { date: daysFromNow(3), slots: ['15:00', '16:00'] },
    date: {
      venueId: 'venue-pergamino',
      scheduledAt: daysFromNow(3),
      status: 'confirmed',
    },
  },
  // 2) Pending match, no venue selections yet → HU-06 redirect.
  {
    id: 'match-pend-mateo-isabella',
    a: 'mateo',
    b: 'isabella',
    compatibilityScore: 7.4,
    status: 'pending',
    createdAt: daysAgo(1),
    venueOptionIds: ['venue-velvet', 'venue-crepes-vegas', 'venue-cine-tesoro'],
    availability: { date: daysFromNow(4), slots: ['17:00'] },
  },
  // 3) Pending match, one side has selected → HU-07 waiting on the other.
  {
    id: 'match-pend-sebastian-daniela',
    a: 'sebastian',
    b: 'daniela',
    compatibilityScore: 8.2,
    status: 'pending',
    createdAt: daysAgo(1),
    venueOptionIds: [
      'venue-sanalberto-bog',
      'venue-libelula-bog',
      'venue-parque93-bog',
    ],
    aSelected: ['venue-sanalberto-bog', 'venue-libelula-bog'],
    availability: { date: daysFromNow(5), slots: ['14:00', '15:00'] },
  },
  // 4) Completed date with positive feedback from both (feeds AC #9 reliability).
  {
    id: 'match-done-felipe-miguel',
    a: 'felipe',
    b: 'miguel',
    compatibilityScore: 8.8,
    status: 'completed',
    createdAt: daysAgo(16),
    date: {
      venueId: 'venue-mamm',
      scheduledAt: daysAgo(12),
      status: 'completed',
      feedback: [
        {
          user: 'felipe',
          occurred: true,
          rating: 5,
          comments: 'Conversación increíble, repetiría sin dudarlo.',
          amountSpent: 46000,
        },
        {
          user: 'miguel',
          occurred: true,
          rating: 5,
          comments: 'Muy buena química, el lugar fue perfecto.',
          amountSpent: 44000,
        },
      ],
    },
  },
  // 5) Completed match but one person did not show (HU-10 no-show path).
  {
    id: 'match-done-sara-manuela',
    a: 'sara',
    b: 'manuela',
    compatibilityScore: 7.9,
    status: 'completed',
    createdAt: daysAgo(23),
    date: {
      venueId: 'venue-velvet',
      scheduledAt: daysAgo(19),
      status: 'completed',
      feedback: [
        {
          user: 'sara',
          occurred: false,
          noShowReason: 'La otra persona no llegó y no avisó.',
        },
        {
          user: 'manuela',
          occurred: false,
          noShowReason: 'Tuve una emergencia familiar de último momento.',
        },
      ],
    },
  },
  // 6) Canceled match — one side rejected within the 24h window (HU-07).
  {
    id: 'match-cancel-tomas-camila',
    a: 'tomas',
    b: 'camila',
    compatibilityScore: 6.1,
    status: 'canceled',
    createdAt: daysAgo(9),
  },
  // 7) Older completed date, mixed feedback (one attended, one didn't answer).
  {
    id: 'match-done-nicolas-sofia',
    a: 'nicolas',
    b: 'sofia',
    compatibilityScore: 8.5,
    status: 'completed',
    createdAt: daysAgo(30),
    date: {
      venueId: 'venue-presidenta',
      scheduledAt: daysAgo(26),
      status: 'completed',
      feedback: [
        {
          user: 'nicolas',
          occurred: true,
          rating: 4,
          comments: 'Buen plan al aire libre, la pasamos bien.',
          amountSpent: 18000,
        },
      ],
    },
  },
];

async function main(): Promise<void> {
  if (process.env.NODE_ENV === 'production') {
    throw new Error('Refusing to seed in production — this wipes tables.');
  }

  const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
  const prisma = new PrismaClient({ adapter });

  try {
    await reset(prisma);
    const hobbyIds = await seedHobbies(prisma);
    await seedVenues(prisma);
    const profileIds = await seedStudents(prisma, hobbyIds);
    // Matches are opt-in. Default: leave the pool unmatched so the weekly matcher
    // (and the HU-09 availability links it fires) can be tested end to end. Set
    // SEED_MATCHES=true to also load the demo matches/reports the admin and
    // chatbot views rely on.
    const seedMatchScenarios = process.env.SEED_MATCHES === 'true';
    if (seedMatchScenarios) {
      await seedMatches(prisma, profileIds);
    }
    logSummary(seedMatchScenarios);
  } finally {
    await prisma.$disconnect();
  }
}

// FK-safe wipe so re-runs start clean. Children before parents.
async function reset(prisma: PrismaClient): Promise<void> {
  await prisma.feedback.deleteMany();
  await prisma.availability.deleteMany();
  await prisma.venueOption.deleteMany();
  await prisma.date.deleteMany();
  await prisma.report.deleteMany();
  await prisma.profileHobby.deleteMany();
  await prisma.photo.deleteMany();
  await prisma.preferences.deleteMany();
  await prisma.match.deleteMany();
  await prisma.emailVerificationCode.deleteMany();
  await prisma.refreshToken.deleteMany();
  await prisma.profile.deleteMany();
  await prisma.hobby.deleteMany();
  await prisma.venue.deleteMany();
  await prisma.user.deleteMany();
}

async function seedHobbies(prisma: PrismaClient): Promise<Map<string, string>> {
  const ids = new Map<string, string>();
  for (const [name, category] of Object.entries(HOBBY_CATALOG)) {
    const hobby = await prisma.hobby.create({ data: { name, category } });
    ids.set(name, hobby.id);
  }
  return ids;
}

async function seedVenues(prisma: PrismaClient): Promise<void> {
  for (const venue of VENUES) {
    await prisma.venue.create({ data: { ...venue, active: true } });
  }
}

// Creates each user + profile + preferences + photos + interests. Returns a map
// of student key -> profileId so matches can attach availabilities/feedback.
async function seedStudents(
  prisma: PrismaClient,
  hobbyIds: Map<string, string>,
): Promise<Map<string, { userId: string; profileId: string }>> {
  const map = new Map<string, { userId: string; profileId: string }>();

  for (const student of STUDENTS) {
    const user = await prisma.user.create({
      data: {
        email: student.email,
        cellphone: student.cellphone,
        isVerified: true,
      },
    });

    const profile = await prisma.profile.create({
      data: {
        userId: user.id,
        name: student.name,
        dateOfBirth: new Date(student.dateOfBirth),
        gender: student.gender,
        height: student.height,
        biography: student.biography,
        university: student.university,
        major: student.major,
        semester: student.semester,
        status: student.status,
      },
    });

    await prisma.photo.createMany({
      data: student.photos.map((url, index) => ({
        profileId: profile.id,
        url,
        isPrimary: index === 0,
      })),
    });

    await prisma.preferences.create({
      data: {
        userId: user.id,
        relationshipType: student.preferences.relationshipType,
        orientation: student.preferences.orientation,
        minAge: student.preferences.minAge,
        maxAge: student.preferences.maxAge,
        genderInterest: student.preferences.genderInterest,
        sameUniversity: student.preferences.sameUniversity,
        heightRange: student.preferences.heightRange,
        // Stored CSV-joined, mirroring PreferencesService.
        energyVibe: student.preferences.energyVibe.join(', '),
      },
    });

    await prisma.profileHobby.createMany({
      data: student.hobbies.map((name) => ({
        profileId: profile.id,
        hobbyId: hobbyIds.get(name)!,
      })),
    });

    map.set(student.key, { userId: user.id, profileId: profile.id });
  }

  return map;
}

async function seedMatches(
  prisma: PrismaClient,
  ids: Map<string, { userId: string; profileId: string }>,
): Promise<void> {
  const userId = (key: string): string => ids.get(key)!.userId;

  for (const seed of MATCHES) {
    const aId = userId(seed.a);
    const bId = userId(seed.b);

    await prisma.match.create({
      data: {
        id: seed.id,
        userAId: aId,
        userBId: bId,
        compatibilityScore: seed.compatibilityScore,
        status: seed.status,
        createdAt: seed.createdAt,
      },
    });

    if (seed.venueOptionIds) {
      const aSel = new Set(seed.aSelected ?? []);
      const bSel = new Set(seed.bSelected ?? []);
      await prisma.venueOption.createMany({
        data: seed.venueOptionIds.map((venueId) => ({
          matchId: seed.id,
          userAId: aId,
          userBId: bId,
          venueId,
          userASelected: aSel.has(venueId),
          userBSelected: bSel.has(venueId),
        })),
      });
    }

    if (seed.availability) {
      const rows = [aId, bId].flatMap((uid) =>
        seed.availability!.slots.map((timeSlot) => ({
          matchId: seed.id,
          userId: uid,
          date: seed.availability!.date,
          timeSlot,
        })),
      );
      await prisma.availability.createMany({ data: rows });
    }

    if (seed.date) {
      const date = await prisma.date.create({
        data: {
          matchId: seed.id,
          venueId: seed.date.venueId,
          scheduledAt: seed.date.scheduledAt,
          status: seed.date.status,
        },
      });
      if (seed.date.feedback) {
        await prisma.feedback.createMany({
          data: seed.date.feedback.map((fb) => ({
            dateId: date.id,
            userId: userId(fb.user),
            occurred: fb.occurred,
            rating: fb.rating ?? null,
            comments: fb.comments ?? null,
            noShowReason: fb.noShowReason ?? null,
            amountSpent: fb.amountSpent ?? null,
          })),
        });
      }
    }
  }

  // A couple of reports so moderation views have data.
  await prisma.report.create({
    data: { userAId: userId('sara'), userBId: userId('manuela') },
  });
  await prisma.report.create({
    data: { userAId: userId('camila'), userBId: userId('tomas') },
  });
}

function logSummary(seededMatches: boolean): void {
  console.log('Seed complete:');
  console.log(`  ${STUDENTS.length} students (verified, full profiles)`);
  console.log(`  ${VENUES.length} venues (Medellín + Bogotá)`);
  console.log(`  ${Object.keys(HOBBY_CATALOG).length} hobbies`);
  console.log(
    seededMatches
      ? `  ${MATCHES.length} matches across statuses + 2 reports`
      : '  0 matches (pool left unmatched — run the weekly matcher to create them)',
  );
  console.log('');
  if (!seededMatches) {
    console.log('To generate matches + availability links (HU-09):');
    console.log('  node dist/src/scripts/run-weekly-matching.js');
    console.log('  (links are logged by WhatsappNotifierService in dev mode)');
    console.log('Or seed the demo matches too: SEED_MATCHES=true npm run db:seed');
    console.log('');
  }
  console.log('Primary test login: valentina.rios@eafit.edu.co');
  console.log('  1) POST /auth/login { email } → code is logged to the server');
  console.log('     console ([dev mail] ...) when SMTP is not configured.');
  console.log('  2) POST /auth/verify with that code to get a session.');
  console.log('Admin view: set ADMIN_EMAILS=valentina.rios@eafit.edu.co');
  console.log('Chatbot: message from cellphone +573001000001 (Valentina).');
}

// Only run when executed directly, so the data can be imported for validation.
if (require.main === module) void main();
