import connectDB from "@/lib/mongodb";
import Book from "@/models/Book";
import { writeFile } from "fs/promises";

import mongoose from "mongoose";
import { NextResponse } from "next/server";
import path from "path";

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  await connectDB();
  try {
    const formData = await request.formData();

    // Check if the author ID is provided and valid
    if (!params.id || !mongoose.Types.ObjectId.isValid(params.id)) {
      return NextResponse.json({ message: "Invalid Book ID" }, { status: 400 });
    }

    // Validate bookType ID
    const author = formData.get("author");
    if (author && !mongoose.Types.ObjectId.isValid(author.toString())) {
      return NextResponse.json(
        { message: "Invalid Author ID" },
        { status: 400 }
      );
    }

    // Prepare the update author object
    const updateBook = {
      name: formData.get("name"),
      ratting: formData.get("ratting"),
      language: formData.get("language"),
      pages: formData.get("pages"),
      description: formData.get("description"),
      image: formData.get("image"),
      pdf: formData.get("pdf"),
      isActive: formData.get("isActive") === "true" ? true : false,
      isFavorite: formData.get("isFavorite") === "true" ? true : false,
      isRecommended: formData.get("isRecommended") === "true" ? true : false,
      isTrending: formData.get("isTrending") === "true" ? true : false,
      author: author
        ? new mongoose.Types.ObjectId(author.toString())
        : undefined,
    };

    // Handle image upload if provided
    const image = formData.get("image") as File;
    const pdf = formData.get("pdf") as File;

    if (image) {
      const buffer = Buffer.from(await image.arrayBuffer());
      const filename = image.name.replace(/ /g, "_");
      const filePath = path.join(
        process.cwd(),
        "public/uploads/images",
        filename
      );

      // Write the image file to the specified path
      await writeFile(filePath, buffer);
      // Update image URL in the author object
      updateBook.image = `http://${request.headers.get(
        "host"
      )}/uploads/images/${filename}`;
    }

    if (pdf) {
      const buffer = Buffer.from(await image.arrayBuffer());
      const filename = image.name.replace(/ /g, "_");
      const filePath = path.join(
        process.cwd(),
        "public/uploads/pdfs",
        filename
      );

      // Write the image file to the specified path
      await writeFile(filePath, buffer);
      // Update image URL in the author object
      updateBook.pdf = `http://${request.headers.get(
        "host"
      )}/uploads/pdfs/${filename}`;
    }

    // Update the author in the database
    const updatedAuthor = await Book.findByIdAndUpdate(params.id, updateBook, {
      new: true,
      runValidators: true,
    });

    if (!updatedAuthor) {
      return NextResponse.json({ message: "Book not found" }, { status: 404 });
    }

    return NextResponse.json(
      {
        message: "Book updated successfully",
        updatedAuthor,
      },
      { status: 200 }
    );
  } catch (error) {
    const errorMessage =
      (error as Error).message || "An unknown error occurred";
    console.error("Error while editing book", errorMessage);
    return NextResponse.json(
      { message: "Error while editing book", errorMessage },
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
    const deletedBook = await Book.findByIdAndDelete(params.id);

    if (!deletedBook) {
      return NextResponse.json(
        NextResponse.json({ message: "Book not found" }, { status: 404 })
      );
    }

    return NextResponse.json({
      message: "Book deleted successfully",
    });
  } catch (error) {
    const errorMessage =
      (error as Error).message || "An unknown error occurred";
    console.error("Error while deleting book", errorMessage);
    return NextResponse.json(
      {
        message: "Errow while deleting book",
        errorMessage,
      },
      { status: 500 }
    );
  }
}

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  const { id } = params;

  try {
    await connectDB();
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ message: "Invalid book ID" }, { status: 400 });
    }

    const book = await Book.findById(id);

    if (!book) {
      return NextResponse.json({ message: "Book not found" }, { status: 404 });
    }

    return NextResponse.json(book);
  } catch (error) {
    const errorMessage =
      (error as Error).message || "An unknown error occurred";
    console.error("Error fetching book details", errorMessage);
    return NextResponse.json(
      { message: "Error fetching book details", errorMessage },
      { status: 500 }
    );
  }
}
