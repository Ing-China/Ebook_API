import connectDB from "@/lib/mongodb";
import BookType from "@/models/BookType";
import { NextResponse } from "next/server";

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  await connectDB();

  try {
    const data = await request.json();
    const { name, isActive } = data;

    const updatedBookType = await BookType.findByIdAndUpdate(
      params.id,
      {
        name,
        isActive,
      },
      { new: true, runValidators: true }
    );

    if (!updatedBookType) {
      return NextResponse.json(
        { message: "Book type not found" },
        {
          status: 404,
        }
      );
    }

    return NextResponse.json(updatedBookType);
  } catch (error) {
    const errorMessage =
      (error as Error).message || "An unknown error occurred";
    console.error("Errow while update book type", errorMessage);
    return NextResponse.json(
      { message: "Error while update book type", errorMessage },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  await connectDB();
  try {
    const deletedBookType = await BookType.findByIdAndDelete(params.id);

    if (!deletedBookType) {
      return NextResponse.json(
        { message: "Book type not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ message: "Book type deleted successfully" });
  } catch (error) {
    const errorMessage =
      (error as Error).message || "An unknown error occurred";
    console.error("Error deleting book type", errorMessage);
    return NextResponse.json(
      { message: "Error deleting book type", errorMessage },
      { status: 500 }
    );
  }
}
