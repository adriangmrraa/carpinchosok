import { verifyJWT } from '../../../../lib/auth';

export async function GET(request: Request) {
  const cookie = request.headers.get('cookie');
  const token = cookie?.match(/token=([^;]+)/)?.[1];

  if (!token) {
    return Response.json({ error: 'No token' }, { status: 401 });
  }

  const payload = verifyJWT(token);
  if (!payload) {
    return Response.json({ error: 'Invalid token' }, { status: 401 });
  }

  // Return user data from payload
  return Response.json(payload);
}