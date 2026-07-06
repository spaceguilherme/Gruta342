import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { photosData } from "../../../data/photos"; 

const prisma = new PrismaClient();

export async function GET() {
  try {
    // CORREÇÃO: Limpa a tabela antes para evitar registros duplicados caso acesse a rota de novo
    await prisma.gallery.deleteMany({});

    const formattedPhotos = photosData.map((photo, index) => ({
      img: photo.img,
      caption: photo.caption || "",
      date: photo.date,
      tags: photo.tags || [],
      isHallOfFame: photo.isHallOfFame || false,
      aspect: photo.aspect || "4:3",
      is_visible: true,
      order: index, 
    }));

    const result = await prisma.gallery.createMany({
      data: formattedPhotos,
    });

    return NextResponse.json({ 
      success: true, 
      message: "Galeria limpa e migrada com sucesso sem duplicatas!", 
      inseridos: result.count 
    });
  } catch (error) {
    console.error("Erro na migração da galeria:", error);
    return NextResponse.json({ error: "Erro na migração." }, { status: 500 });
  }
}