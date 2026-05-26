const grafana = {
    id: "grafana",
    label: "Grafana",

    getQuestions() {
        return [
            {
                type: "input",
                name: "name",
                message: "Nom du Docker",
                default: "grafana"
            },
            {
                type: "number",
                name: "portUI",
                message: "Port UI",
                default: 3000
            },
            {
                type: "input",
                name: "hostPath",
                message: "Chemin du dossier sur l'hôte :",
                default: "/srv/docker/grafana"
            }
        ]
    },

    validateSpecific(answers) {
        const errors = []
        const warnings = []
        const data = { ...answers }

        return {
            errors,
            warnings,
            data
        }
    },

    buildComposeFragment(validData) {
        return {
            container_name: validData.name,
            image: "grafana/grafana",
            restart: "unless-stopped",
            ports: [
                `\"${validData.portUI}:3000\"`
            ],
            volumes: [
                `${validData.hostPath}/data:/var/lib/grafana`
            ]
        }
    }
}

export default grafana