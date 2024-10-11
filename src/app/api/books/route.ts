import connectDB from "@/lib/mongodb";
import { NextResponse } from "next/server";
import path from "path";
import { writeFile } from "fs/promises";
import mongoose from "mongoose";
import Book from "@/models/Book";
import BookType from "@/models/BookType";
import Author from "@/models/Author";

export async function POST(request: Request) {
  await connectDB();

  try {
    const formData = await request.formData();

    const name = formData.get("name");
    const ratting = formData.get("ratting");
    const language = formData.get("language");
    const pages = formData.get("pages");
    const description = formData.get("description");
    const author = formData.get("author")?.toString().replace(/"/g, "").trim();
    const bookType = formData
      .get("bookType")
      ?.toString()
      .replace(/"/g, "")
      .trim();
    const image = formData.get("image") as File;
    const pdf = formData.get("pdf") as File;

    const buffer = Buffer.from(await image.arrayBuffer());
    const pdfBuff = Buffer.from(await pdf.arrayBuffer());

    const filename = image.name.replace(/ /g, "_");
    const pdfFileName = pdf.name.replace(/ /g, "_");

    const filePath = path.join(
      process.cwd(),
      "public/uploads/images",
      filename
    );

    const pdfPath = path.join(
      process.cwd(),
      "public/uploads/pdfs",
      pdfFileName
    );

    await writeFile(filePath, buffer);
    await writeFile(pdfPath, pdfBuff);

    const baseUrl =
      process.env.NEXT_PUBLIC_API_BASE_URL ||
      `http://${request.headers.get("host")}`;

    const imageUrl = `${baseUrl}/uploads/images/${filename}`;

    const pdfUrl = `${baseUrl}/uploads/pdfs/${filename}`;

    // const imageUrl = `${baseUrl}/uploads/images/${filename}`;

    // const imageUrl = `http://${request.headers.get(
    //   "host"
    // )}/uploads/images/${filename}`;

    // const pdfUrl = `http://${request.headers.get(
    //   "host"
    // )}/uploads/pdfs/${pdfFileName}`;

    const newBook = new Book({
      name,
      ratting,
      language,
      pages,
      description,
      author: new mongoose.Types.ObjectId(author),
      bookType: new mongoose.Types.ObjectId(bookType),
      image: imageUrl,
      pdf: pdfUrl,
    });

    await newBook.save();

    return NextResponse.json(newBook, { status: 201 });
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

export async function GET(request: Request) {
  try {
    await connectDB();
    const booktypes = await BookType.find();
    const authors = await Author.find();

    console.log(booktypes);
    console.log(authors);

    const { searchParams } = new URL(request.url);
    const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
    const limit = Math.max(1, parseInt(searchParams.get("limit") || "10", 10));
    const skip = (page - 1) * limit;

    const [books, totalCount] = await Promise.all([
      Book.find({ isActive: true })
        .skip(skip)
        .limit(limit)
        .populate("author", "name")
        .populate("bookType", "name"),
      Book.countDocuments({ isActive: true }),
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

export async function DELETE(request: Request) {
  await connectDB();

  try {
    const result = await Book.deleteMany({}); // This deletes all book records

    return NextResponse.json(
      { message: `${result.deletedCount} book(s) deleted.` },
      { status: 200 }
    );
  } catch (error) {
    const errorMessage =
      (error as Error).message || "An unknown error occurred";
    console.error("Error deleting books", errorMessage);
    return NextResponse.json(
      { message: "Error deleting books", errorMessage },
      { status: 500 }
    );
  }
}
