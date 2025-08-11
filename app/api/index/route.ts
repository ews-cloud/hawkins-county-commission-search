import { NextResponse } from 'next/server'
import data from '@/public/index.json'
export const runtime = 'nodejs'
export async function GET() { return NextResponse.json(data) }