// Load env vars
import { config } from 'dotenv';
config({ path: '../.env.local', override: true });

// Hardcode for testing
process.env.NOCODB_BASE_URL = 'https://n8n-nocodbgala.yn8wow.easypanel.host';
process.env.NOCODB_API_TOKEN = 'GfJQf9T70iY9EWtgBpNiOMwq_FeiZn4THEXE0lig';
process.env.NOCODB_BASE_ID = 'pgbvayxguam9h71';
process.env.NOCODB_TABLE_ID_PADRON = 'mphqy3zrto3ivsz';
process.env.NOCODB_TABLE_ID_USUARIOS = 'mtga492zgykafjm';
process.env.NOCODB_TABLE_ID_PROPUESTAS = 'mbn0wr6qdbbq7s8';
process.env.NOCODB_TABLE_ID_VOTOS = 'm34l02ugjvwbt8x';
process.env.NOCODB_TABLE_ID_REPORTES = 'mvx86wuqsg3v7pk';
process.env.NOCODB_TABLE_ID_NOTIFICACIONES = 'm8n7ysg9ul1qasy';

console.log('NOCODB_BASE_URL:', process.env.NOCODB_BASE_URL);
console.log('NOCODB_TABLE_ID_PADRON:', process.env.NOCODB_TABLE_ID_PADRON);

// Import after setting env

import {
  getPadronByDni,
  getUsuarioByDniOrEmail,
  crearUsuarioApp,
  getPropuestas,
  createPropuesta,
  buscarVoto,
  createVoto,
  crearReporte,
  crearNotificacion,
  getUsuarioById,
  getVotosByUsuario,
} from '../lib/nocodb';
import { hashPassword } from '../lib/auth';

async function testPadron() {
  console.log('🧪 Testing Padron Electoral...');
  try {
    // Try to fetch a record (assuming there's at least one)
    const padron = await getPadronByDni('12345678'); // Adjust DNI if needed
    if (padron) {
      console.log('✅ Padron connection OK. Sample record:', padron);
    } else {
      console.log('⚠️ No record found for test DNI, but connection OK');
    }
  } catch (error) {
    console.error('❌ Padron test failed:', error);
  }
}

async function testUsuario() {
  console.log('🧪 Testing Usuarios...');
  try {
    // Check existing
    const existing = await getUsuarioByDniOrEmail('test@example.com');
    if (existing) {
      console.log('⚠️ Test user already exists:', existing);
      return;
    }

    // Create test user
    const hashedPassword = await hashPassword('testpass123');
    const testUser = {
      dni: '99999999',
      padronId: 1, // Assume exists
      email: 'test@example.com',
      passwordHash: hashedPassword,
      emailVerificado: true,
      perfilPrivado: false,
      mostrarNombrePublico: true,
      mostrarVotosPublicos: true,
      nombreMostrado: 'Usuario Test',
      ultimaLat: -34.6,
      ultimaLng: -58.3,
      createdAt: new Date().toISOString(),
    };

    const created = await crearUsuarioApp(testUser);
    console.log('✅ Usuario created:', created);

    // Fetch it back
    const fetched = await getUsuarioByDniOrEmail('test@example.com');
    console.log('✅ Usuario fetched:', fetched);

  } catch (error) {
    console.error('❌ Usuario test failed:', error);
  }
}

async function testPropuestas() {
  console.log('🧪 Testing Propuestas...');
  try {
    // Get existing
    const existing = await getPropuestas();
    console.log('✅ Propuestas fetched:', existing.length, 'records');

    // Create test proposal
    const testProposal = {
      titulo: 'Propuesta de Test',
      descripcion: 'Esta es una propuesta de prueba',
      autorId: 1, // Assume user exists
      localidad: 'Buenos Aires',
      createdAt: new Date().toISOString(),
    };

    const created = await createPropuesta(testProposal);
    console.log('✅ Propuesta created:', created);

  } catch (error) {
    console.error('❌ Propuestas test failed:', error);
  }
}

async function testVotos() {
  console.log('🧪 Testing Votos...');
  try {
    // Create test vote
    const testVote = {
      usuarioId: 1,
      propuestaId: 1,
      valor: 1 as 1 | -1,
      createdAt: new Date().toISOString(),
    };

    const created = await createVoto(testVote);
    console.log('✅ Voto created:', created);

    // Check existing
    const existing = await buscarVoto(1, 1);
    console.log('✅ Voto fetched:', existing);

  } catch (error) {
    console.error('❌ Votos test failed:', error);
  }
}

async function testReportes() {
  console.log('🧪 Testing Reportes...');
  try {
    // Create test report
    const testReport = {
      usuarioId: 1,
      propuestaId: 1,
      motivo: 'Test report',
      createdAt: new Date().toISOString(),
    };

    const created = await crearReporte(testReport);
    console.log('✅ Reporte created:', created);

  } catch (error) {
    console.error('❌ Reportes test failed:', error);
  }
}

async function testNotificaciones() {
  console.log('🧪 Testing Notificaciones...');
  try {
    // Create test notification
    const testNotif = {
      usuarioId: 1,
      propuestaId: 1,
      tipo: 'voto_positivo' as const,
      mensaje: 'Test notification',
      leida: false,
      createdAt: new Date().toISOString(),
    };

    const created = await crearNotificacion(testNotif);
    console.log('✅ Notificacion created:', created);

  } catch (error) {
    console.error('❌ Notificaciones test failed:', error);
  }
}

async function testUserProfile(userId: number) {
  console.log(`🧪 Testing User Profile for ID: ${userId}...`);
  try {
    // Get user data
    const user = await getUsuarioById(userId);
    if (!user) {
      console.log('❌ User not found');
      return;
    }

    console.log('✅ User data:', {
      id: user.id,
      nombreMostrado: user.nombreMostrado,
      perfilPrivado: user.perfilPrivado,
      mostrarNombrePublico: user.mostrarNombrePublico,
      mostrarVotosPublicos: user.mostrarVotosPublicos,
    });

    // Get user's votes
    const votes = await getVotosByUsuario(userId);
    console.log(`✅ User has ${votes.length} votes:`);
    votes.forEach((vote, index) => {
      console.log(`  ${index + 1}. Proposal ID: ${vote.propuestaId}, Value: ${vote.valor}, Date: ${vote.createdAt}`);
    });

    // Check privacy logic
    const shouldShowVotes = !user.perfilPrivado && user.mostrarVotosPublicos;
    console.log(`✅ Should show votes publicly: ${shouldShowVotes}`);

  } catch (error) {
    console.error('❌ User profile test failed:', error);
  }
}

async function runTests() {
  console.log('🚀 Starting NocoDB Connection Tests...\n');

  await testPadron();
  console.log('');

  await testUsuario();
  console.log('');

  await testPropuestas();
  console.log('');

  await testVotos();
  console.log('');

  await testReportes();
  console.log('');

  await testNotificaciones();
  console.log('');

  // Test specific user profile (change ID as needed)
  await testUserProfile(3); // Assuming user ID 3 is the one with issues
  console.log('');

  console.log('🏁 Tests completed!');
}

runTests().catch(console.error);