import fs from "node:fs/promises"
import path from "path"

async function logger(composeObject, outputDir, finalPath) {
    const date = new Date().toISOString()
    const service = Object.values(composeObject.services ?? {})[0]
    const logPath = path.join(outputDir, "compose-generator.log")

    const content = `
        Date: ${date}
        Output directory: ${outputDir}
        Compose file: ${finalPath}
        Container name: ${service?.container_name ?? "unknown"}
        Image: ${service?.image ?? "unknown"}
        Ports: ${service?.ports?.join(", ") ?? ""}
        Volumes: ${service?.volumes?.join(", ") ?? ""}
        `

    await fs.writeFile(logPath, content.trim(), "utf8")
    return logPath
}

export default logger