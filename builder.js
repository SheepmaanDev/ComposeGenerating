function buildCompose(data) {
    const ports = [`${data.portUI}:9443`]

    if (data.edgeEnabled === true) {
        ports.push(`${data.portEdge}:8000`)
    }

    const volumes = [
        `${data.hostPath}:/data`,
        "/var/run/docker.sock:/var/run/docker.sock:ro"
    ]

    const environment = [`TZ=Europe/Paris`]

    const result = {
        services: {
            portainer: {
                container_name: data.name,
                image: "portainer/portainer-ce:lts",
                restart: "unless-stopped",
                ports,
                volumes,
                environment
            }
        }
    }
    return result
}

export default buildCompose













const data = {
    name: "portainer",
    portUI: 9443,
    edgeEnabled: true,
    portEdge: 8000,
    hostPath: "/srv/portainer/data",
    timezone: "Europe/Paris"
}