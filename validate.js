function validate(composeObject) {
    const errors = []
    const warnings = []

    if (composeObject.name === "") {
        errors.push({
            field: "name",
            code: "EMPTY_NAME",
            message: "Le nom du Docker ne peut pas être vide.",
            blocking: true
        })
    }
    if (composeObject.hostPath === "" || composeObject.hostPath === ".") {
        errors.push({
            field: "hostPath",
            code: "INVALID_HOST_PATH",
            message: "Le chemin du dossier ne peut pas être vide.",
            blocking: true
        })
    }
    if (!Number.isInteger(composeObject.portUI)) {
        errors.push({
            field: "portUI",
            code: "INVALID_PORT_UI",
            message: "Le port d'interface utilisateur doit être un entier.",
            blocking: true
        })
    }

    return {
        data: composeObject,
        errors,
        warnings
    }
}

export default validate