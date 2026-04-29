import { ai } from "@/ai/genkit";
import { NextRequest, NextResponse } from "next/server";
import { DEFAULT_PRODUCT_CATEGORIES } from "@/types";

export async function POST(request: NextRequest) {
  try {
    const { productName } = await request.json();

    if (!productName?.trim()) {
      return NextResponse.json({ error: "productName is required" }, { status: 400 });
    }

    const categoriesList = DEFAULT_PRODUCT_CATEGORIES.join(", ");

    const result = await ai.generate({
      prompt: `Dado el nombre de producto: "${productName}", selecciona UNA categoría de esta lista exacta: ${categoriesList}. Responde SOLO con el nombre exacto de la categoría, sin explicación, sin puntos, sin comillas.`,
    });

    const category = result.text.trim();

    if (!DEFAULT_PRODUCT_CATEGORIES.includes(category)) {
      return NextResponse.json({ category: "Otros" });
    }

    return NextResponse.json({ category });
  } catch (error) {
    console.error("Error suggesting category:", error);
    return NextResponse.json({ error: "Failed to suggest category" }, { status: 500 });
  }
}
