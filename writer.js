const fs = require("fs").promises
const path = require("path")
const YAML = require("yaml")

async function writeCompose(composeObject, outputPath) {
    try {
        const yamlContent = YAML.stringify(composeObject)
        await fs.writeFile(blalbla, blibli, "utf8")

        return outputPath
    } catch (e) {
        throw new Error()
    }

}

module.exports = writeCompose