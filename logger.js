import fs from "node:fs/promises"
import path from "path"

async function logger(composeObject, outputDir, finalPath) {
    const date = new Date().toISOString()
    const service = composeObject.services.portainer
    const logPath = path.join(outputDir, "compose-generator.log")

    const content = `
    Date: ${date}
    Output directory: ${outputDir}
    Compose file: ${finalPath}
    Container name: ${service.container_name}
    Image: ${service.image}
    Ports: ${service.ports.join(", ")}
    Volumes: ${service.volumes.join(", ")}
    `

    await fs.writeFile(logPath, content.trim(), "utf8")
    return logPath
}

export default logger