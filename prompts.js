import inquirer from "inquirer"

import serviceRegistry from "./service-registry.js"

async function askQuestions() {
    const serviceChoices = Object.values(serviceRegistry).map((service) => ({
        name: service.label,
        value: service.id
    }))

    const { serviceId } = await inquirer.prompt([
        {
            type: "rawlist",
            name: "serviceId",
            message: "Quel service veux-tu générer ?",
            choices: serviceChoices
        }
    ])

    const selectedService = serviceRegistry[serviceId]

    const serviceAnswers = await inquirer.prompt(
        selectedService.getQuestions()
    )

    return {
        serviceId,
        ...serviceAnswers
    }
}

export default askQuestions