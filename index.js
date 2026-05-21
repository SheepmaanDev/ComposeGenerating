import inquirer from "inquirer"
import fs from "node:fs/promises"

import askQuestions from "./prompts.js"
import validate from "./validate.js"
import buildCompose from "./builder.js"
import writeCompose from "./writer.js"

async function main() {
    try {
        const answers = await askQuestions()

        console.log("\nRésumé des informations du docker :")
        console.log(` - Nom du docker     : ${answers.name}`)
        console.log(` - Port UI           : ${answers.portUI}`)
        console.log(` - Edge              : ${answers.edgeEnabled ? "enabled" : "disabled"}`)
        if (answers.edgeEnabled) {
            console.log(` - Port Edge         : ${answers.portEdge}`)
        }
        console.log(` - Chemin du dossier : ${answers.hostPath}\n`)

        const confirm = await inquirer.prompt([
            {
                type: "confirm",
                name: "confirmed",
                message: "Es-tu sûr de ces informations ?",
                default: true
            }
        ])

        const finalAnswers = {
            ...answers,
            confirmed: confirm.confirmed
        }
        if (!finalAnswers.confirmed) {
            console.log("Opération annulée.")
            return
        } else {
            console.log("Opération validée.")
            const validationResult = await validate(finalAnswers)
            const hasBlockingErrors = validationResult.errors.some(
                (error) => error.blocking === true
            )
            const hasWarnings = validationResult.warnings.length > 0

            if (hasBlockingErrors) {
                for (const error of validationResult.errors) {
                    console.error(`- [${error.code}] : ${error.message}`)
                }
                return
            }
            if (hasWarnings) {
                for (const warning of validationResult.warnings) {
                    console.warn(`- [${warning.code}] : ${warning.message}`)
                    if (warning.code === "NOT_EXIST_HOST_PATH") {
                        const createHostPath = await inquirer.prompt([
                            {
                                type: "confirm",
                                name: "confirmed",
                                message: "Veux-tu créer le répertoire ?",
                                default: true
                            }
                        ])
                        if (createHostPath.confirmed) {
                            fs.mkdirSync(validationResult.data.hostPath, { recursive: true })
                            console.log("Le dossier a bien été créé !")
                        } else {
                            console.log("Refus de création de dossier.")
                        }
                    }
                }
            }
            console.log("Validation OK !")
            const composeObject = buildCompose(validationResult.data)
            console.dir(composeObject, { depth: null })
            const finalPath = await writeCompose(composeObject, validationResult.data.hostPath)
            console.log("Fichier créé à cet emplacement : " + finalPath)
        }
    } catch (e) {
        console.error("Erreur :", e.message)
    }
}

main()