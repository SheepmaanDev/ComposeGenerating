function buildCompose(data) {
    const result = {
        services: {
            portainer: {
                container_name: data.name,
                image: "portainer/portainer-ce:latest",
                restart: "unless-stopped",
                ports: data.portsAll,
                volumes: data.volumes,
                environment: data.environment
            }
        }
    }

    return result
}

module.exports = buildCompose

const data = {
    name: "portainer",
    portsAll: ["9443:9443"],
    volumes: ["./portainer/data:/data", "/var/run/docker.sock:/var/run/docker.sock"],
    environment: ["TZ=Europe/Paris"]
}