const fs = require("fs").promises
const path = require("path")
const YAML = require("yaml")

async function writeCompose(composeObject, outputDir) {
    try {
        const finalPath = path.join(outputDir, "docker-compose.yml")
        const yamlContent = YAML.stringify(composeObject)

        await fs.mkdir(outputDir, { recursive: true })
        await fs.writeFile(finalPath, yamlContent, "utf8")

        return finalPath
    } catch (e) {
        throw new Error(`Impossible d'écrire le fichier docker-compose : ${e.message}`)
    }
}

module.exports = writeCompose