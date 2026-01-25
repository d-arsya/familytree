"use server"

import { writeFile, mkdir } from "fs/promises"
import { join } from "path"

export async function uploadFile(formData: FormData) {
    const file = formData.get("file") as File
    if (!file) {
        return { error: "No file uploaded" }
    }

    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)
    let uploadDir: string
    if (process.env.NODE_ENV == 'development') {
        uploadDir = join(process.cwd(), "public", "uploads")
    } else {
        uploadDir = join(process.cwd(), "uploads")
    }

    try {
        await mkdir(uploadDir, { recursive: true })

        // Create unique filename
        const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9)
        const filename = uniqueSuffix + "-" + file.name.replace(/[^a-zA-Z0-9.-]/g, "")
        const filepath = join(uploadDir, filename)

        await writeFile(filepath, buffer)

        return { url: `/uploads/${filename}` }
    } catch (error) {
        console.error("Upload error:", error)
        return { error: "Failed to save file" }
    }
}
