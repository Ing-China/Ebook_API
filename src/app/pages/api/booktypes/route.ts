import connectDB from "@/lib/mongodb";
import BookType from "@/models/BookType";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  try {
    await connectDB();

    // Extract pagination parameters from query
    const { searchParams } = new URL(request.url);
    const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10)); // Ensure page is at least 1
    const limit = Math.max(1, parseInt(searchParams.get("limit") || "10", 10)); // Ensure limit is at least 1
    const skip = (page - 1) * limit;

    // Fetch paginated book types where isActive is true
    const [bookTypes, totalCount] = await Promise.all([
      BookType.find({ isActive: true }).skip(skip).limit(limit),
      BookType.countDocuments({ isActive: true }),
    ]);

    return NextResponse.json({
      bookTypes,
      pagination: {
        totalCount,
        totalPages: Math.ceil(totalCount / limit),
        currentPage: page,
        pageSize: limit,
      },
    });
  } catch (error) {
    console.error("Error fetching book types", error);
    return NextResponse.json(
      { message: "Error fetching book types" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    await connectDB();
    const data = await request.json();
    const newBookType = new BookType({
      name: data.name,
      isActive: data.isActive !== undefined ? data.isActive : true,
    });

    await newBookType.save();
    return NextResponse.json(newBookType, { status: 201 });
  } catch (error) {
    const errorMessage =
      (error as Error).message || "An unknown error occurred";

    console.error("Error creating book type:", errorMessage);
    return NextResponse.json(
      { message: "Error creating book type", error: errorMessage },
      { status: 400 }
    );
  }
}
