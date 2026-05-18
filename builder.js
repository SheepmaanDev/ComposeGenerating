function buildCompose(data) {
    const ports = [`${data.portUI}:9443`]

    if (data.edgeEnabled === true) {
        ports.push(`${data.portEdge}:8000`)
    }

    const volumes = [
        `${data.hostPath}`,
        "/var/run/docker.sock:/var/run/docker.sock:ro"
    ]

    const environment = [`TZ=${data.timezone}`]

    const result = {
        services: {
            portainer: {
                container_name: data.name,
                image: "portainer/portainer-ce:latest",
                restart: "unless-stopped",
                ports,
                volumes,
                environment
            }
        }
    }

    return result
}

module.exports = buildCompose













const data = {
    name: "portainer",
    portUI: 9443,
    edgeEnabled: true,
    portEdge: 8000,
    hostPath: "/srv/portainer/data",
    timezone: "Europe/Paris"
}