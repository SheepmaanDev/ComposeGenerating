import fs from "node:fs"
import net from "node:net"

async function validate(composeObject) {
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

    const hostPathExists = fs.existsSync(composeObject.hostPath)
    if (!hostPathExists) {
        warnings.push({
            field: "hostPath",
            code: "NOT_EXIST_HOST_PATH",
            message: "Le chemin du dossier n'éxiste pas.",
            blocking: false
        })
    }
    if (hostPathExists) {
        if (!fs.statSync(composeObject.hostPath).isDirectory()) {
            errors.push({
                field: "hostPath",
                code: "NOT_DIRECTORY_HOST_PATH",
                message: "Le chemin du dossier n'est pas pas un répertoire.",
                blocking: true
            })
        }
    }

    const isPortUIFormatValid = Number.isInteger(composeObject.portUI) && composeObject.portUI > 0
    if (!isPortUIFormatValid) {
        errors.push({
            field: "portUI",
            code: "INVALID_PORT_UI",
            message: "Le port d'interface utilisateur doit être un entier positif.",
            blocking: true
        })
    } else {
        const resultPortAvailableUI = await isPortAvailable(composeObject.portUI)
        if (!resultPortAvailableUI) {
            errors.push({
                field: "portUI",
                code: "ALREADY_USED_PORT_UI",
                message: "Le port d'interface utilisateur est déjà utilisé.",
                blocking: true
            })
        }
    }

    const isPortEdgeFormatValid = Number.isInteger(composeObject.portEdge) && composeObject.portEdge > 0
    if (composeObject.edgeEnabled === true) {
        if (!isPortEdgeFormatValid) {
            errors.push({
                field: "portEdge",
                code: "INVALID_PORT_EDGE",
                message: "Le port Edge doit être un entier positif.",
                blocking: true
            })
        } else {
            const resultPortAvailableEdge = await isPortAvailable(composeObject.portEdge)
            if (!resultPortAvailableEdge) {
                errors.push({
                    field: "portEdge",
                    code: "ALREADY_USED_PORT_EDGE",
                    message: "Le port Edge est déjà utilisé.",
                    blocking: true
                })
            }
        }
    }

    return {
        data: composeObject,
        errors,
        warnings
    }
}

async function isPortAvailable(port) {
    return new Promise((resolve) => {
        const server = net.createServer()
        server.once("error", (e) => {
            if (e.code === 'EADDRINUSE') {
                resolve(false)
                return
            } else {
                resolve(false)
            }
        })
        server.listen(port, () => {
            server.close(() => resolve(true))
        })
    })
}

export default validate