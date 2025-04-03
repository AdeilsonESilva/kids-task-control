import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const child = await prisma.child.update({
      where: { id: params.id },
      data: { name: body.name },
    });
    return NextResponse.json(child);
  } catch (error) {
    console.error("Error updating child:", error);
    return NextResponse.json(
      { error: "Error updating child" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    await prisma.child.delete({
      where: { id: params.id },
    });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting child:", error);
    return NextResponse.json(
      { error: "Error deleting child" },
      { status: 500 }
    );
  }
}