import { NextRequest, NextResponse } from "next/server";
import { getAdminSession } from "@/lib/data";
import { createSupabaseServer, isSupabaseConfigured } from "@/lib/supabase/server";
import fs from "fs/promises";
import path from "path";

export async function POST(req: NextRequest) {
  try {
    const session = await getAdminSession();
    if (session.status !== "admin" && session.status !== "demo") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    const bucket = (formData.get("bucket") as string) || "products";

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    // Validate mime type
    if (!file.type.startsWith("image/")) {
      return NextResponse.json({ error: "Only image files are allowed" }, { status: 400 });
    }

    // Size limit: 15MB
    if (file.size > 15 * 1024 * 1024) {
      return NextResponse.json({ error: "Image size exceeds 15MB limit" }, { status: 400 });
    }

    const ext = file.name.split(".").pop()?.toLowerCase() || "jpg";
    const cleanBase = file.name
      .replace(/\.[^/.]+$/, "")
      .toLowerCase()
      .replace(/[^a-z0-9_-]/g, "-")
      .slice(0, 40);
    const fileName = `${cleanBase || "img"}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}.${ext}`;

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // 1. Live Supabase Storage mode
    if (isSupabaseConfigured) {
      const supabase = await createSupabaseServer();
      const storagePath = bucket === "site" ? `site/${fileName}` : `products/${fileName}`;
      const bucketName = "products"; // Products bucket exists in schema.sql

      const { error: uploadError } = await supabase.storage
        .from(bucketName)
        .upload(storagePath, buffer, {
          contentType: file.type || "image/jpeg",
          upsert: true,
        });

      if (uploadError) {
        console.error("Supabase Storage upload error:", uploadError);
        return NextResponse.json({ error: uploadError.message }, { status: 500 });
      }

      const { data: urlData } = supabase.storage.from(bucketName).getPublicUrl(storagePath);
      return NextResponse.json({
        success: true,
        url: urlData.publicUrl,
        name: file.name,
      });
    }

    // 2. Demo / Local development mode: Save to public/images/uploads/
    try {
      const uploadsDir = path.join(process.cwd(), "public", "images", "uploads");
      await fs.mkdir(uploadsDir, { recursive: true });
      const targetPath = path.join(uploadsDir, fileName);
      await fs.writeFile(targetPath, buffer);
      return NextResponse.json({
        success: true,
        url: `/images/uploads/${fileName}`,
        name: file.name,
      });
    } catch (fsError: any) {
      console.warn("Could not write to local disk, falling back to data URL:", fsError);
      // Fallback to data URL
      const base64 = buffer.toString("base64");
      const dataUrl = `data:${file.type};base64,${base64}`;
      return NextResponse.json({
        success: true,
        url: dataUrl,
        name: file.name,
      });
    }
  } catch (err: any) {
    console.error("Upload error:", err);
    return NextResponse.json({ error: err.message || "Failed to upload image" }, { status: 500 });
  }
}
