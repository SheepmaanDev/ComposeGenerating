import fs from "node:fs/promises"
import path from "path"

async function logger(composeObject, outputDir, finalPath) {
    const date = new Date().toISOString()
    const [serviceName = "unknown", service = null] =
        Object.entries(composeObject.services ?? {})[0] ?? []

    const logPath = path.join(outputDir, "compose-generator.log")

    const content = [
        `Date: ${date}`,
        `Output directory: ${outputDir}`,
        `Compose file: ${finalPath}`,
        `Service name: ${serviceName}`,
        `Container name: ${service?.container_name ?? "unknown"}`,
        `Image: ${service?.image ?? "unknown"}`,
        `Ports: ${service?.ports?.join(", ") ?? ""}`,
        `Volumes: ${service?.volumes?.join(", ") ?? ""}`
    ].join("\n")

    await fs.writeFile(logPath, content, "utf8")
    return logPath
}

export default logger