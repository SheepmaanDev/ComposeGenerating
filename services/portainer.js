const portainer = {
    id: "portainer",
    label: "Portainer",

    getQuestions() {
        return [
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
        ]
    },

    validateSpecific(answers) {
        const errors = []
        const warnings = []
        const data = { ...answers }

        if (data.edgeEnabled !== true) {
            data.portEdge = null
        }

        if (data.edgeEnabled === true && data.portUI === data.portEdge) {
            errors.push({
                field: "portEdge",
                code: "SAME_PORT_UI_EDGE",
                message: "Le port UI et le port Edge doivent être différents.",
                blocking: true
            })
        }

        return {
            errors,
            warnings,
            data
        }
    },

    buildComposeFragment(validData) {
        return {
            container_name: validData.name,
            image: "portainer/portainer-ce:lts",
            restart: "unless-stopped",
            ports: [
                `\"${validData.portUI}:9443\"`,
                ...(validData.edgeEnabled === true ? [`\"${validData.portEdge}:8000\"`] : [])
            ],
            volumes: [
                "/var/run/docker.sock:/var/run/docker.sock",
                `${validData.hostPath}/data:/data`
            ],
            environment: [
                `TZ=Europe/Paris`
            ]
        }
    }
}

export default portainer