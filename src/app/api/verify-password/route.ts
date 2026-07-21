import { NextRequest, NextResponse } from 'next/server'

const EDIT_PASSWORD = 'NK2@@1King'

export async function POST(req: NextRequest) {
  try {
    const { password } = await req.json()

    if (!password || typeof password !== 'string') {
      return NextResponse.json({ success: false, message: 'Password is required' }, { status: 400 })
    }

    // Constant-time comparison to prevent timing attacks
    let match = true
    if (password.length !== EDIT_PASSWORD.length) {
      match = false
    } else {
      for (let i = 0; i < password.length; i++) {
        if (password[i] !== EDIT_PASSWORD[i]) {
          match = false
        }
      }
    }

    if (match) {
      return NextResponse.json({ success: true })
    } else {
      return NextResponse.json({ success: false, message: 'Incorrect password' }, { status: 401 })
    }
  } catch {
    return NextResponse.json({ success: false, message: 'Invalid request' }, { status: 400 })
  }
}