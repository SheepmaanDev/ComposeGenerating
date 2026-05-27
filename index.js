import inquirer from "inquirer"
import fs from "node:fs/promises"

import askQuestions from "./prompts.js"
import validate from "./validate.js"
import buildCompose from "./builder.js"
import writeCompose from "./writer.js"
import logger from "./logger.js"

async function main() {
    let validationResult = null
    let composeObject = null

    try {
        const answers = await askQuestions()

        console.log("\nRésumé des informations du docker :")
        console.log(` - Service           : ${answers.serviceId}`)
        console.log(` - Nom du docker     : ${answers.name}`)
        if (answers.portUI !== undefined) {
            console.log(` - Port UI           : ${answers.portUI}`)
        }
        if (answers.edgeEnabled !== undefined) {
            console.log(` - Edge              : ${answers.edgeEnabled ? "enabled" : "disabled"}`)
        }
        if (answers.portEdge !== undefined && answers.edgeEnabled === true) {
            console.log(` - Port Edge         : ${answers.portEdge}`)
        }
        if (answers.hostPath !== undefined) {
            console.log(` - Chemin du dossier : ${answers.hostPath}`)
        }
        console.log("")

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
        }
        console.log("Opération validée.")

        validationResult = await validate(finalAnswers)
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
                        try {
                            await fs.mkdir(validationResult.data.hostPath, { recursive: true })
                            console.log("Le dossier a bien été créé !")
                        } catch (e) {
                            if (e.code === "EACCES") {
                                console.error("Permissions insuffisantes pour créer ce dossier.")
                                console.error("Choisis un dossier accessible en écriture ou crée-le manuellement avec sudo.")
                                return
                            }
                            throw e
                        }
                    } else {
                        console.log("Refus de création de dossier.")
                        return
                    }
                }
            }
        }
        console.log("Validation et vérifications terminées.")

        composeObject = buildCompose(validationResult.data)
        const finalPath = await writeCompose(composeObject, validationResult.data.hostPath)
        console.log(`Docker-compose créé à cet emplacement : ${finalPath}`)

        const logPath = await logger(composeObject, validationResult.data.hostPath, finalPath)
        console.log(`Log créé à cet emplacement : ${logPath}`)
    } catch (e) {
        if (e.message.includes("FILE_ALREADY_EXISTS")) {
            console.log("Un fichier docker-compose.yml existe déjà dans ce répertoire.")

            const overwriteConfirm = await inquirer.prompt([
                {
                    type: "confirm",
                    name: "confirmed",
                    message: "Veux-tu écraser le docker-compose.yml existant ?",
                    default: false
                }
            ])

            if (!overwriteConfirm.confirmed) {
                console.log("Écrasement annulé.")
                return
            }

            const finalPath = await writeCompose(
                composeObject,
                validationResult.data.hostPath,
                { overwrite: true }
            )
            console.log(`Docker-compose écrasé à cet emplacement : ${finalPath}`)

            const logPath = await logger(composeObject, validationResult.data.hostPath, finalPath)
            console.log(`Log créé à cet emplacement : ${logPath}`)
            return
        }
        console.error("Erreur :", e.message)
    }
}

main()