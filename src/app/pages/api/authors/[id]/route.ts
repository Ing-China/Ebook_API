import connectDB from "@/lib/mongodb";
import Author from "@/models/Author";
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
      return NextResponse.json(
        { message: "Invalid Author ID" },
        { status: 400 }
      );
    }

    // Validate bookType ID
    const bookType = formData.get("bookType");
    if (bookType && !mongoose.Types.ObjectId.isValid(bookType.toString())) {
      return NextResponse.json(
        { message: "Invalid Book Type ID" },
        { status: 400 }
      );
    }

    // Prepare the update author object
    // const updateAuthor = {
    //   name: formData.get("name"),
    //   age: formData.get("age"),
    //   bookCount: formData.get("bookCount"),
    //   bio: formData.get("bio"),
    //   isActive: formData.get("isActive") === "true" ? true : false,
    //   bookType: bookType
    //     ? new mongoose.Types.ObjectId(bookType.toString())
    //     : undefined,
    // };

    const updateAuthor: {
      name: FormDataEntryValue | null;
      age: FormDataEntryValue | null;
      bookCount: FormDataEntryValue | null;
      bio: FormDataEntryValue | null;
      isActive: boolean;
      bookType?: mongoose.Types.ObjectId;
      image?: string; // Declaring image as optional
    } = {
      name: formData.get("name"),
      age: formData.get("age"),
      bookCount: formData.get("bookCount"),
      bio: formData.get("bio"),
      isActive: formData.get("isActive") === "true" ? true : false,
      bookType: bookType
        ? new mongoose.Types.ObjectId(bookType.toString())
        : undefined,
    };

    // Handle image upload if provided
    const image = formData.get("image") as File;
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
      updateAuthor.image = `http://${request.headers.get(
        "host"
      )}/uploads/images/${filename}`;
    }

    // Update the author in the database
    const updatedAuthor = await Author.findByIdAndUpdate(
      params.id,
      updateAuthor,
      {
        new: true,
        runValidators: true,
      }
    );

    if (!updatedAuthor) {
      return NextResponse.json(
        { message: "Author not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        message: "Author updated successfully",
        updatedAuthor,
      },
      { status: 200 }
    );
  } catch (error) {
    const errorMessage =
      (error as Error).message || "An unknown error occurred";
    console.error("Error while editing author", errorMessage);
    return NextResponse.json(
      { message: "Error while editing author", errorMessage },
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
    const deletedAuthor = await Author.findByIdAndDelete(params.id);

    if (!deletedAuthor) {
      return NextResponse.json(
        NextResponse.json({ message: "Author not found" }, { status: 404 })
      );
    }

    return NextResponse.json({
      message: "Author deleted successfully",
    });
  } catch (error) {
    const errorMessage =
      (error as Error).message || "An unknown error occurred";
    console.error("Error while deleting author", errorMessage);
    return NextResponse.json(
      {
        message: "Errow while deleting author",
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
      return NextResponse.json(
        { message: "Invalid author ID" },
        { status: 400 }
      );
    }

    const author = await Author.findById(id);

    if (!author) {
      return NextResponse.json(
        { message: "Author not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(author);
  } catch (error) {
    const errorMessage =
      (error as Error).message || "An unknown error occurred";
    console.error("Error fetching author details", errorMessage);
    return NextResponse.json(
      { message: "Error fetching author details", errorMessage },
      { status: 500 }
    );
  }
}
