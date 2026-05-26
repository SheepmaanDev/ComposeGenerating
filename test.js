import inquirer from "inquirer"

const answer = await inquirer.prompt([
    {
        type: "rawlist",
        name: "serviceId",
        message: "Quel service veux-tu générer ?",
        choices: [
            { name: "Portainer", value: "portainer" },
            { name: "Grafana", value: "grafana" }
        ]
    }
])

console.log(answer)