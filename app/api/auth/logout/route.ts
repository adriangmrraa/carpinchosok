import { NextResponse } from 'next/server';

export async function POST() {
  try {
    // Create response that clears the token cookie
    const response = NextResponse.json({ message: 'Logged out successfully' });

    // Clear the token cookie with multiple approaches for better compatibility
    response.cookies.set('token', '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 0, // Expire immediately
    });

    return response;
  } catch (error) {
    console.error('Logout error:', error);
    return NextResponse.json({ error: 'Failed to logout' }, { status: 500 });
  }
}