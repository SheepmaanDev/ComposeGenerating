const exemple = {
    id: "exemple",
    label: "Exemple",

    getQuestions() {
        return [

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
            image: "exempler:lts",
            restart: "unless-stopped",
            ports: [
                `${validData.portUI}:9443`,
                ...(validData.edgeEnabled === true ? [`${validData.portEdge}:8000`] : [])
            ],
            volumes: [
                "/var/run/docker.sock:/var/run/docker.sock",
                `${validData.hostPath}/data:/data`
            ]
        }
    }
}

export default exemple