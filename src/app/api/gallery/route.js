import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET() {
  try {
    const photos = await prisma.gallery.findMany({
      orderBy: { order: 'desc' } 
    });
    return NextResponse.json(photos);
  } catch (error) {
    return NextResponse.json({ error: "Erro ao buscar galeria" }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const data = await request.json();
    
    // Se enviarmos várias fotos juntas (Lote), usa o createMany
    if (Array.isArray(data)) {
       const result = await prisma.gallery.createMany({ data });
       return NextResponse.json({ success: true, count: result.count }, { status: 201 });
    } 
    // Se for uma foto só
    const photo = await prisma.gallery.create({ data });
    return NextResponse.json(photo, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Erro ao criar mídia" }, { status: 500 });
  }
}