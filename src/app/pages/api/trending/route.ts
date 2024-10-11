import connectDB from "@/lib/mongodb";
import { NextResponse } from "next/server";
import Book from "@/models/Book";

export async function GET(request: Request) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
    const limit = Math.max(1, parseInt(searchParams.get("limit") || "10", 10));
    const skip = (page - 1) * limit;

    const [books, totalCount] = await Promise.all([
      Book.find({ isActive: true, isRecommended: true })
        .skip(skip)
        .limit(limit)
        .populate("author", "name")
        .populate("bookType", "name"),
      Book.countDocuments({ isActive: true, isRecommended: true }),
    ]);

    return NextResponse.json({
      books: books,
      pagination: {
        totalCount,
        totalPages: Math.ceil(totalCount / limit),
        currentPage: page,
        pageSize: limit,
      },
    });
  } catch (error) {
    const errorMessage =
      (error as Error).message || "An unknown error occurred";
    console.error("Error fetching books", errorMessage);
    return NextResponse.json(
      { message: "Error fetching books", errorMessage },
      { status: 500 }
    );
  }
}
