import inquirer from "inquirer"
import askQuestions from "./prompts.js"
import validate from "./validate.js"

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
            // console.log(finalAnswers)
            const validationResult = validate(finalAnswers)
            console.log(validationResult)
        }
    } catch (e) {
        console.error("Erreur :", e.message)
    }
}

main()