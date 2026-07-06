import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../../../auth/[...nextauth]/route"; 
import { prisma } from "../../../../../lib/prisma"; 

// 1. EDITAR EVENTO EXISTENTE (PUT)
export async function PUT(req, { params }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user?.roles?.includes("admin")) {
      return NextResponse.json({ message: "Não autorizado." }, { status: 403 });
    }

    // CORRIGIDO: Agora aguardamos o Promise do params resolver
    const { id } = await params; 
    const data = await req.json();

    // Atualiza o evento incluindo as novas colunas de Imagem, Tags e Visibilidade
    const updatedEvent = await prisma.event.update({
      where: { id },
      data: {
        title: data.title,
        description: data.description,
        date: data.date,
        time: data.time || "", 
        category: data.category,
        bannerUrl: data.bannerUrl,
        tags: data.tags || [],
        is_visible: data.is_visible,
      },
    });

    return NextResponse.json(updatedEvent, { status: 200 });
  } catch (error) {
    console.error("Erro ao atualizar evento:", error);
    return NextResponse.json({ message: "Erro ao atualizar evento." }, { status: 500 });
  }
}

// 2. EXCLUIR EVENTO (DELETE)
export async function DELETE(req, { params }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user?.roles?.includes("admin")) {
      return NextResponse.json({ message: "Não autorizado." }, { status: 403 });
    }

    // CORRIGIDO: Agora aguardamos o Promise do params resolver
    const { id } = await params;

    await prisma.event.delete({
      where: { id },
    });

    return NextResponse.json({ message: "Evento excluído com sucesso." }, { status: 200 });
  } catch (error) {
    console.error("Erro ao excluir evento:", error);
    return NextResponse.json({ message: "Erro ao excluir evento." }, { status: 500 });
  }
}