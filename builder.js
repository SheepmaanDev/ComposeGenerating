import serviceRegistry from "./service-registry.js"

function buildCompose(data) {
    const selectedService = serviceRegistry[data.serviceId]

    if (!selectedService) {
        throw new Error("UNKNOWN_SERVICE")
    }

    const serviceFragment = selectedService.buildComposeFragment(data)

    return {
        services: {
            [selectedService.id]: serviceFragment
        }
    }
}

export default buildCompose