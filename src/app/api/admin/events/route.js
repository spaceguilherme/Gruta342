import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../../auth/[...nextauth]/route"; 
import { prisma } from "../../../../lib/prisma";

// 1. ROTA PARA CRIAR UM NOVO EVENTO (POST)
export async function POST(req) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user?.roles?.includes("admin")) {
      return NextResponse.json({ message: "Acesso Negado. Apenas administradores." }, { status: 403 });
    }

    const { title, description, date, time, category, bannerUrl, tags } = await req.json();

    // Validação corrigida (time não é obrigatório para "past")
    if (!title || !description || !date || !category) {
      return NextResponse.json({ message: "Por favor, preencha todos os campos obrigatórios." }, { status: 400 });
    }
    if (category === "upcoming" && !time) {
      return NextResponse.json({ message: "Horário é obrigatório para próximos eventos." }, { status: 400 });
    }

    const newEvent = await prisma.event.create({
      data: { 
        title, 
        description, 
        date, 
        time: time || "", 
        category, 
        bannerUrl, 
        tags: tags || [] 
      },
    });

    return NextResponse.json(newEvent, { status: 201 });
  } catch (error) {
    console.error("Erro ao criar evento:", error);
    return NextResponse.json({ message: "Erro interno no servidor." }, { status: 500 });
  }
}

// 2. ROTA PARA BUSCAR E LISTAR TODOS OS EVENTOS (GET)
export async function GET() {
  try {
    // Trocamos 'createdAt: "desc"' por 'date: "asc"' para virar ordem cronológica real
    const events = await prisma.event.findMany({
      orderBy: { date: "asc" },
    });
    
    return NextResponse.json(events, { status: 200 });
  } catch (error) {
    console.error("Erro ao buscar eventos:", error);
    return NextResponse.json({ message: "Erro ao listar eventos." }, { status: 500 });
  }
}