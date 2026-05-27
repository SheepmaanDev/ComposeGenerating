import fs from "node:fs/promises"
import path from "path"
import YAML from "yaml"

async function writeCompose(composeObject, outputDir, options = {}) {
    const { overwrite = false } = options

    const finalPath = path.join(outputDir, "docker-compose.yml")
    const yamlContent = YAML.stringify(composeObject)

    await fs.mkdir(outputDir, { recursive: true })

    try {
        await fs.writeFile(finalPath, yamlContent, {
            encoding: "utf8",
            flag: overwrite ? "w" : "wx"
        })

        return finalPath
    } catch (e) {
        if (e.code === "EEXIST") {
            throw new Error("FILE_ALREADY_EXISTS")
        }

        throw new Error(`Impossible d'écrire le fichier docker-compose : ${e.message}`)
    }
}

export default writeCompose