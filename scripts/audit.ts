import * as fs from 'fs';
import * as path from 'path';

const envVars = [
  'NOCODB_BASE_URL',
  'NOCODB_API_TOKEN',
  'NOCODB_BASE_ID',
  'NOCODB_TABLE_ID_PADRON',
  'NOCODB_TABLE_ID_USUARIOS',
  'NOCODB_TABLE_ID_PROPUESTAS',
  'NOCODB_TABLE_ID_VOTOS',
  'NOCODB_TABLE_ID_REPORTES',
  'NOCODB_TABLE_ID_NOTIFICACIONES',
  'JWT_SECRET',
];

console.log('=== Auditoría de Variables de Entorno ===');
envVars.forEach(v => {
  const val = process.env[v];
  if (val) {
    console.log(`${v}: OK (length: ${val.length})`);
  } else {
    console.log(`${v}: MISSING`);
  }
});

console.log('\n=== Auditoría de Endpoints API ===');
function scanDir(dir: string, prefix = ''): void {
  const items = fs.readdirSync(dir);
  items.forEach(item => {
    const fullPath = path.join(dir, item);
    const stat = fs.statSync(fullPath);
    if (stat.isDirectory()) {
      scanDir(fullPath, prefix + '/' + item);
    } else if (item === 'route.ts') {
      const methods = ['GET', 'POST', 'PATCH', 'DELETE'];
      methods.forEach(method => {
        if (fs.existsSync(path.join(dir, method.toLowerCase() + '.ts'))) {
          console.log(`${method} ${prefix}`);
        }
      });
      console.log(`Route ${prefix}`);
    }
  });
}

scanDir('app/api');