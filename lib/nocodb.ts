import {
  PadronElectoral,
  UsuarioApp,
  Propuesta,
  Voto,
  Reporte,
  Notificacion,
} from '../types';

// --- helpers base ---

const getBaseUrl = () => process.env.NOCODB_BASE_URL?.replace(/\/$/, '') || '';
const getApiV2 = () => `${getBaseUrl()}/api/v2`;
const getApiV1 = () => `${getBaseUrl()}/api/v1`;
const getBaseSlug = () => process.env.NOCODB_BASE_SLUG || '';

// Table IDs for API v2
const getTablePadron = () => process.env.NOCODB_TABLE_ID_PADRON || '';
const getTableUsuarios = () => process.env.NOCODB_TABLE_ID_USUARIOS || '';
const getTablePropuestas = () => process.env.NOCODB_TABLE_ID_PROPUESTAS || '';
const getTableVotos = () => process.env.NOCODB_TABLE_ID_VOTOS || '';
const getTableReportes = () => process.env.NOCODB_TABLE_ID_REPORTES || '';
const getTableNotificaciones = () => process.env.NOCODB_TABLE_ID_NOTIFICACIONES || '';

// Table names for API v1
const getTableNamePadron = () => process.env.NOCODB_TABLE_NAME_PADRON || '';
const getTableNameUsuarios = () => process.env.NOCODB_TABLE_NAME_USUARIOS || '';
const getTableNamePropuestas = () => process.env.NOCODB_TABLE_NAME_PROPUESTAS || '';
const getTableNameVotos = () => process.env.NOCODB_TABLE_NAME_VOTOS || '';
const getTableNameReportes = () => process.env.NOCODB_TABLE_NAME_REPORTES || '';
const getTableNameNotificaciones = () => process.env.NOCODB_TABLE_NAME_NOTIFICACIONES || '';

const getDefaultHeaders = () => ({
  'xc-token': process.env.NOCODB_API_TOKEN || '',
  'Content-Type': 'application/json',
});

// helper genérico para v2
async function listRecords(tableId: string, query?: string) {
  const url = `${getApiV2()}/tables/${tableId}/records${query ? `?${query}` : ''}`;
  console.log(`NocoDB Query: ${url}`);
  const res = await fetch(url, { headers: getDefaultHeaders() });

  if (!res.ok) {
    const errorText = await res.text();
    console.error(`NocoDB Error Response:`, errorText);
    throw new Error(`NocoDB list error (${tableId}): ${res.status} ${res.statusText}`);
  }
  const data = await res.json();
  return data.list ?? [];
}

async function createRecord<T>(tableId: string, body: any): Promise<T> {
  const url = `${getApiV2()}/tables/${tableId}/records`;
  const res = await fetch(url, {
    method: 'POST',
    headers: getDefaultHeaders(),
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    throw new Error(`NocoDB create error (${tableId}): ${res.status} ${res.statusText}`);
  }
  const data = await res.json();
  return data as T;
}

async function updateRecord<T>(tableId: string, id: number, body: any): Promise<T> {
  const url = `${getApiV2()}/tables/${tableId}/records/${id}`;
  const res = await fetch(url, {
    method: 'PATCH', // Back to PATCH - NocoDB doesn't support PUT
    headers: getDefaultHeaders(),
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const errorText = await res.text();
    console.error(`NocoDB PATCH error response:`, errorText);
    throw new Error(`NocoDB update error (${tableId}): ${res.status} ${res.statusText}`);
  }
  const data = await res.json();
  return data as T;
}

async function deleteRecord(tableId: string, id: number): Promise<void> {
  const url = `${getApiV2()}/tables/${tableId}/records/${id}`;
  console.log(`NocoDB DELETE: ${url}`);
  const res = await fetch(url, {
    method: 'DELETE',
    headers: getDefaultHeaders(),
  });

  if (!res.ok) {
    const errorText = await res.text();
    console.error(`NocoDB DELETE error response:`, errorText);
    throw new Error(`NocoDB delete error (${tableId}): ${res.status} ${res.statusText}`);
  }
}

// --- API v1 helpers (for PATCH/DELETE operations) ---

async function deleteRecordV1(tableName: string, id: number): Promise<void> {
  const url = `${getApiV1()}/db/data/v1/${getBaseSlug()}/${tableName}/${id}`;
  const res = await fetch(url, {
    method: 'DELETE',
    headers: getDefaultHeaders(),
  });

  if (!res.ok) {
    const errorText = await res.text();
    console.error(`NocoDB v1 DELETE error (${tableName}): ${res.status} ${res.statusText} - ${errorText}`);
    throw new Error(`NocoDB v1 delete error (${tableName}): ${res.status} ${res.statusText}`);
  }
}

async function updateRecordV1<T>(tableName: string, id: number, body: any): Promise<T> {
  const url = `${getApiV1()}/db/data/v1/${getBaseSlug()}/${tableName}/${id}`;
  const res = await fetch(url, {
    method: 'PATCH',
    headers: getDefaultHeaders(),
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const errorText = await res.text();
    console.error(`NocoDB v1 PATCH error (${tableName}): ${res.status} ${res.statusText} - ${errorText}`);
    throw new Error(`NocoDB v1 update error (${tableName}): ${res.status} ${res.statusText}`);
  }

  const data = await res.json();
  return data as T;
}

// --- funciones de dominio ---

export async function getPropuestas(): Promise<Propuesta[]> {
  const list = await listRecords(getTablePropuestas());
  return list.map((item: any) => ({
    ...item,
    id: item.Id || item.id,
  })) as Propuesta[];
}

export async function createPropuesta(
  nueva: Omit<Propuesta, 'id'>,
): Promise<Propuesta> {
  return createRecord<Propuesta>(getTablePropuestas(), nueva);
}

export async function createVoto(
  nueva: Omit<Voto, 'id'>,
): Promise<Voto> {
  return createRecord<Voto>(getTableVotos(), nueva);
}

export async function updateVoto(
  id: number,
  updates: Partial<Voto>,
): Promise<Voto> {
  return updateRecord<Voto>(getTableVotos(), id, updates);
}

export async function getPadronByDni(dni: string): Promise<PadronElectoral | null> {
  const where = encodeURIComponent(`(dni,eq,${dni})`);
  const list = await listRecords(getTablePadron(), `where=${where}&limit=1`);
  return (list[0] as PadronElectoral) ?? null;
}

export async function getUsuarioByDniOrEmail(
  dniOrEmail: string,
): Promise<UsuarioApp | null> {
  const where = encodeURIComponent(
    `(dni,eq,${dniOrEmail})~or(email,eq,${dniOrEmail})`,
  );
  const list = await listRecords(getTableUsuarios(), `where=${where}&limit=1`);
  if (!list[0]) return null;

  // Map NocoDB response to match TypeScript interface
  const user = list[0];
  return {
    ...user,
    id: user.Id || user.id, // Map Id to id
  } as UsuarioApp;
}

export async function crearUsuarioApp(
  nueva: Omit<UsuarioApp, 'id'>,
): Promise<UsuarioApp> {
  const result = await createRecord<any>(getTableUsuarios(), nueva);
  return {
    ...result,
    id: result.Id || result.id,
  } as UsuarioApp;
}

export async function buscarVoto(
  usuarioId: number,
  propuestaId: number,
): Promise<Voto | null> {
  const where = encodeURIComponent(
    `(usuarioId,eq,${usuarioId})~and(propuestaId,eq,${propuestaId})`,
  );
  const list = await listRecords(getTableVotos(), `where=${where}&limit=1`);
  if (!list[0]) return null;
  const item = list[0];
  return {
    ...item,
    id: item.Id || item.id,
  } as Voto;
}

export async function getVotosByUsuario(usuarioId: number): Promise<Voto[]> {
  const where = encodeURIComponent(`(usuarioId,eq,${usuarioId})`);
  const list = await listRecords(getTableVotos(), `where=${where}`);
  return list.map((item: any) => ({
    ...item,
    id: item.Id || item.id,
  })) as Voto[];
}

export async function crearReporte(
  nueva: Omit<Reporte, 'id'>,
): Promise<Reporte> {
  return createRecord<Reporte>(getTableReportes(), nueva);
}

export async function crearNotificacion(
  nueva: Omit<Notificacion, 'id'>,
): Promise<Notificacion> {
  return createRecord<Notificacion>(getTableNotificaciones(), nueva);
}

// contadores simples
export async function getVotosPositivos(propuestaId: number): Promise<number> {
  const where = encodeURIComponent(`(propuestaId,eq,${propuestaId})`);
  const list = await listRecords(getTableVotos(), `where=${where}`);
  // Filter by valor === 1 (convert string to number)
  return list.filter((v: any) => (typeof v.valor === 'string' ? parseInt(v.valor) : v.valor) === 1).length;
}

export async function getVotosNegativos(propuestaId: number): Promise<number> {
  const where = encodeURIComponent(`(propuestaId,eq,${propuestaId})`);
  const list = await listRecords(getTableVotos(), `where=${where}`);
  // Filter by valor === -1 (convert string to number)
  return list.filter((v: any) => (typeof v.valor === 'string' ? parseInt(v.valor) : v.valor) === -1).length;
}

export async function getCantidadReportes(propuestaId: number): Promise<number> {
  const where = encodeURIComponent(`(propuestaId,eq,${propuestaId})`);
  const list = await listRecords(getTableReportes(), `where=${where}`);
  return list.length;
}

export async function getUsuarioById(id: number): Promise<UsuarioApp | null> {
  const where = encodeURIComponent(`(Id,eq,${id})`);
  const list = await listRecords(getTableUsuarios(), `where=${where}&limit=1`);
  if (!list[0]) return null;

  const user = list[0];
  return {
    ...user,
    id: user.Id || user.id,
  } as UsuarioApp;
}

export async function getUsuarioNombreById(id: number): Promise<string> {
  const user = await getUsuarioById(id);
  if (!user) return 'Usuario desconocido';

  // Return display name based on privacy settings
  if (user.mostrarNombrePublico) {
    return user.nombreMostrado || 'Usuario';
  } else {
    return 'Usuario anónimo';
  }
}

export async function getNotificacionesByUsuario(
  usuarioId: number,
  soloNoLeidas?: boolean,
): Promise<Notificacion[]> {
  let where = `(usuarioId,eq,${usuarioId})`;
  if (soloNoLeidas) {
    where += `~and(leida,eq,false)`;
  }
  const list = await listRecords(
    getTableNotificaciones(),
    `where=${encodeURIComponent(where)}`,
  );
  return list as Notificacion[];
}

export async function updateNotificacionLeida(id: number): Promise<void> {
  await updateRecord(getTableNotificaciones(), id, { leida: true });
}

export async function updateUsuario(
  id: number,
  updates: Partial<UsuarioApp>,
): Promise<UsuarioApp> {
  const result = await updateRecordV1<any>(getTableNameUsuarios(), id, updates);
  return {
    ...result,
    id: result.Id || result.id,
  } as UsuarioApp;
}

export async function updatePropuesta(
  id: number,
  updates: Partial<Propuesta>,
): Promise<Propuesta> {
  return updateRecordV1<Propuesta>(getTableNamePropuestas(), id, updates);
}

export async function deleteVotosByPropuesta(propuestaId: number): Promise<void> {
  // Get all votes for this proposal
  const where = encodeURIComponent(`(propuestaId,eq,${propuestaId})`);
  const votes = await listRecords(getTableVotos(), `where=${where}`);

  // Delete each vote
  for (const vote of votes) {
    const voteId = vote.Id || vote.id;
    if (voteId) {
      await deleteRecord(getTableVotos(), voteId);
    }
  }
}

export async function deletePropuesta(id: number): Promise<void> {
  // First delete all votes for this proposal
  await deleteVotosByPropuesta(id);

  // Then delete the proposal itself
  await deleteRecordV1(getTableNamePropuestas(), id);
}

export async function getPropuestaById(id: number): Promise<Propuesta | null> {
  const where = encodeURIComponent(`(Id,eq,${id})`);
  const list = await listRecords(getTablePropuestas(), `where=${where}&limit=1`);
  if (!list[0]) return null;
  const item = list[0];
  return {
    ...item,
    id: item.Id || item.id,
  } as Propuesta;
}