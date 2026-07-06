import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function PUT(request, { params }) {
  try {
    // CORREÇÃO: Adicionamos o 'await' aqui porque no Next.js atual params é uma Promise
    const { id } = await params;
    const data = await request.json();
    
    const game = await prisma.game.update({
      where: { id },
      data: {
        title: data.title,
        category: data.category,
        image: data.image,
        badge: data.badge || null,
        is_visible: data.is_visible,
      }
    });
    return NextResponse.json(game);
  } catch (error) {
    console.error("Erro ao atualizar jogo:", error);
    return NextResponse.json({ error: "Erro ao atualizar jogo" }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  try {
    // CORREÇÃO: Adicionamos o 'await' aqui também!
    const { id } = await params;
    
    await prisma.game.delete({
      where: { id }
    });
    return NextResponse.json({ success: true, message: "Jogo deletado." });
  } catch (error) {
    console.error("Erro ao deletar jogo:", error);
    return NextResponse.json({ error: "Erro ao deletar jogo" }, { status: 500 });
  }
}