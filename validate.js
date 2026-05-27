import fs from "node:fs"
import net from "node:net"

import serviceRegistry from "./service-registry.js"

async function validate(answers) {
    const errors = []
    const warnings = []
    let data = { ...answers }

    if (data.name === "") {
        errors.push({
            field: "name",
            code: "EMPTY_NAME",
            message: "Le nom du Docker ne peut pas être vide.",
            blocking: true
        })
    }

    if (data.hostPath === "" || data.hostPath === ".") {
        errors.push({
            field: "hostPath",
            code: "INVALID_HOST_PATH",
            message: "Le chemin du dossier ne peut pas être vide.",
            blocking: true
        })
    }

    const hostPathExists = fs.existsSync(data.hostPath)
    if (!hostPathExists) {
        warnings.push({
            field: "hostPath",
            code: "NOT_EXIST_HOST_PATH",
            message: "Le chemin du dossier n'existe pas.",
            blocking: false
        })
    }

    if (hostPathExists) {
        if (!fs.statSync(data.hostPath).isDirectory()) {
            errors.push({
                field: "hostPath",
                code: "NOT_DIRECTORY_HOST_PATH",
                message: "Le chemin du dossier n'est pas un répertoire.",
                blocking: true
            })
        }
    }

    if (data.portUI !== undefined) {
        const isPortUIFormatValid = Number.isInteger(data.portUI) && data.portUI > 0

        if (!isPortUIFormatValid) {
            errors.push({
                field: "portUI",
                code: "INVALID_PORT_UI",
                message: "Le port d'interface utilisateur doit être un entier positif.",
                blocking: true
            })
        } else {
            const resultPortAvailableUI = await isPortAvailable(data.portUI)
            if (!resultPortAvailableUI) {
                errors.push({
                    field: "portUI",
                    code: "ALREADY_USED_PORT_UI",
                    message: "Le port d'interface utilisateur est déjà utilisé.",
                    blocking: true
                })
            }
        }
    }

    const selectedService = serviceRegistry[data.serviceId]

    if (!selectedService) {
        errors.push({
            field: "serviceId",
            code: "UNKNOWN_SERVICE",
            message: "Le service sélectionné est inconnu.",
            blocking: true
        })

        return {
            data,
            errors,
            warnings
        }
    }

    const specificResult = selectedService.validateSpecific(data)
    data = specificResult.data

    errors.push(...specificResult.errors)
    warnings.push(...specificResult.warnings)

    return {
        data,
        errors,
        warnings
    }
}

async function isPortAvailable(port) {
    return new Promise((resolve) => {
        const server = net.createServer()
        server.once("error", (e) => {
            if (e.code === "EADDRINUSE") {
                resolve(false)
                return
            }
            resolve(false)
        })
        server.listen(port, () => {
            server.close(() => resolve(true))
        })
    })
}

export default validate