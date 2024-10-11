import connectDB from "@/lib/mongodb";
import Author from "@/models/Author";
import { NextResponse } from "next/server";
import path from "path";
import { writeFile } from "fs/promises";
import mongoose from "mongoose";
import BookType from "@/models/BookType";

export async function GET(request: Request) {
  try {
    await connectDB();
    const booktypes = await BookType.find();

    console.log(booktypes);

    const { searchParams } = new URL(request.url);
    const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
    const limit = Math.max(1, parseInt(searchParams.get("limit") || "10", 10));
    const skip = (page - 1) * limit;

    const [authors, totalCount] = await Promise.all([
      Author.find({ isActive: true })
        .skip(skip)
        .limit(limit)
        .populate("bookType", "name"),
      Author.countDocuments({ isActive: true }),
    ]);

    return NextResponse.json({
      authors: authors,
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
    console.error("Error fetching authors", errorMessage);
    return NextResponse.json(
      { message: "Error fetching authors", errorMessage },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  await connectDB();

  try {
    const formData = await request.formData();

    const name = formData.get("name");
    const age = formData.get("age");
    const bookCount = formData.get("bookCount");
    const bio = formData.get("bio");
    const bookType = formData
      .get("bookType")
      ?.toString()
      .replace(/"/g, "")
      .trim();

    const image = formData.get("image") as File;

    const buffer = Buffer.from(await image.arrayBuffer());

    const filename = image.name.replace(/ /g, "_");

    const filePath = path.join(
      process.cwd(),
      "public/uploads/images",
      filename
    );

    await writeFile(filePath, buffer);

    // const imageUrl = `http://${request.headers.get(
    //   "host"
    // )}/uploads/images/${filename}`;

    const baseUrl =
      process.env.NEXT_PUBLIC_API_BASE_URL ||
      `http://${request.headers.get("host")}`;

    const imageUrl = `${baseUrl}/uploads/images/${filename}`;

    const newAuthor = new Author({
      name,
      age,
      bookCount,
      bio,
      image: imageUrl,
      bookType: new mongoose.Types.ObjectId(bookType),
    });

    await newAuthor.save();

    return NextResponse.json(newAuthor, { status: 201 });
  } catch (error) {
    const errorMessage =
      (error as Error).message || "An unknown error occurred";
    console.error("Error creating book", errorMessage);
    return NextResponse.json(
      { message: "Error creating book", errorMessage },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  await connectDB();

  try {
    const result = await Author.deleteMany({}); // This deletes all author records

    return NextResponse.json(
      { message: `${result.deletedCount} author(s) deleted.` },
      { status: 200 }
    );
  } catch (error) {
    const errorMessage =
      (error as Error).message || "An unknown error occurred";
    console.error("Error deleting authors", errorMessage);
    return NextResponse.json(
      { message: "Error deleting authors", errorMessage },
      { status: 500 }
    );
  }
}
