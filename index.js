// const askQuestions = require("./prompts.js")
import inquirer from "inquirer"
import askQuestions from "./prompts.js"
import { input } from "@inquirer/prompts"
import { type } from "node:os"

async function main() {
    try {
        const answers = await askQuestions()
        // console.log(answers)

        console.log("\nRésumé des informations du docker :")
        console.log(` - Nom du docker     : ${answers.name}`)
        console.log(` - Port UI           : ${answers.portUI}`)
        console.log(` - Edge              : ${answers.edgeEnabled ? "enabled" : "disabled"}`)
        if (answers.edgeEnabled) {
            console.log(` - Port Edge         : ${answers.portEdge}`)
        }
        console.log(` - Chemin du dossier : ${answers.hostPath}`)
        console.log(`Confirmer ?`)

        const confirm = await inquirer.prompt([
            {
                type: "input",
                name: "confirmed",
                message: "Es-tu sûr de ces informations ? (o/oui/y/yes/no/non/n)",
                defaut: 
            }
        ])
    } catch (e) {
        console.error("Erreur :", e.message)
    }
}

main()
