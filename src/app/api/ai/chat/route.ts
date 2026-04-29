import { ai } from "@/ai/genkit";
import { NextRequest, NextResponse } from "next/server";
import type { Product } from "@/types";

export async function POST(request: NextRequest) {
  try {
    const { question, products } = (await request.json()) as {
      question: string;
      products: Product[];
    };

    if (!question?.trim()) {
      return NextResponse.json({ error: "question is required" }, { status: 400 });
    }

    const inventorySummary = (products ?? []).map((p) => ({
      nombre: p.name,
      precio: `$${p.price.toFixed(2)}`,
      categoría: p.category,
      tienda: p.storeName || "sin especificar",
      comprado: p.isPurchased ? "sí" : "no",
      favorito: p.isFavorite ? "sí" : "no",
      fechaCompra: p.purchaseDate ?? null,
      historialPrecios: (p.priceHistory ?? []).slice(0, 3).map((h) => `$${h.price.toFixed(2)}`),
      notas: p.notes ?? null,
    }));

    const result = await ai.generate({
      prompt: `Eres un asistente personal de inventario y gastos. El usuario tiene los siguientes ${inventorySummary.length} productos registrados:

${JSON.stringify(inventorySummary, null, 2)}

El usuario pregunta: "${question}"

Responde de forma concisa y útil en español. Si hay totales o precios, preséntalos claramente. Si el usuario pregunta algo que no puedes saber con los datos disponibles, díselo amablemente.`,
    });

    return NextResponse.json({ answer: result.text });
  } catch (error) {
    console.error("Error in chat:", error);
    return NextResponse.json({ error: "Failed to process chat" }, { status: 500 });
  }
}
