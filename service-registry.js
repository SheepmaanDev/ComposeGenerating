import portainer from "./services/portainer.js"
import grafana from "./services/grafana.js"

const serviceRegistry = {
    [portainer.id]: portainer,
    [grafana.id]: grafana
}

export default serviceRegistry