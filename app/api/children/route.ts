import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET() {
  try {
    const children = await prisma.child.findMany();
    return NextResponse.json(children);
  } catch (error) {
    console.error("Error fetching children:", error);
    return NextResponse.json(
      { error: "Error fetching children" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const child = await prisma.child.create({
      data: {
        name: body.name,
      },
    });
    return NextResponse.json(child);
  } catch (error) {
    console.error("Error creating child:", error);
    return NextResponse.json(
      { error: "Error creating child" },
      { status: 500 }
    );
  }
}