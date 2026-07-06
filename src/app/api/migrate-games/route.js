import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { gamesData } from "../../../data/games"; // Ajuste o caminho correto para chegar no seu arquivo games.js

const prisma = new PrismaClient();

export async function GET() {
  try {
    // Mapeia os dados do arquivo para o formato que o banco de dados espera
    const formattedGames = gamesData.map((game) => ({
      title: game.title,
      category: game.category,
      image: game.image, // Por enquanto, salva o caminho local (ex: /assets/games/dbd.jpg)
      badge: game.badge || null,
      is_visible: true,
    }));

    // Insere todos os registros de uma vez no banco
    const result = await prisma.game.createMany({
      data: formattedGames,
    });

    return NextResponse.json({ 
      success: true, 
      message: "Jogos migrados com sucesso!", 
      inseridos: result.count 
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Erro na migração." }, { status: 500 });
  }
}