import inquirer from "inquirer"
import path from "path"

async function askQuestions() {
    const answers = await inquirer.prompt([
        {
            type: "input",
            name: "name",
            message: "Nom du Docker",
            default: "portainer"
        },
        {
            type: "number",
            name: "portUI",
            message: "Port UI",
            default: 9443
        },
        {
            type: "confirm",
            name: "edgeEnabled",
            message: "Activer Edge ?",
            default: false
        },
        {
            type: "number",
            name: "portEdge",
            message: "PortEdge",
            default: 8000,
            when: (answers) => answers.edgeEnabled === true
        },
        {
            type: "input",
            name: "hostPath",
            message: "Chemin du dossier sur l'hôte :",
            default: "/srv/docker/portainer"
        }
    ])

    if (answers.edgeEnabled !== true) {
        answers.portEdge = null
    }

    answers.name = answers.name.trim().toLowerCase().replaceAll(" ", "-")
    answers.hostPath = answers.hostPath.trim()
    answers.hostPath = path.posix.normalize(answers.hostPath)

    if (answers.hostPath !== "/") {
        answers.hostPath = answers.hostPath.replace(/\/+$/, "")
    }

    return answers
}

// async function askConfirmation () {
//     const answers = await inquirer.prompt([

//     ])
// }

export default askQuestions