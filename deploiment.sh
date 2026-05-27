#!/usr/bin/env bash
set -euo pipefail

# =========================
# Configuration
# =========================
GROUP_NAME="composegen"
BASE_DIR="/srv/docker"
ACL_PACKAGE="acl"

# =========================
# Couleurs
# =========================
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
BOLD='\033[1m'
NC='\033[0m'

# =========================
# Helpers UI
# =========================
info()    { echo -e "${CYAN}[INFO]${NC} $1"; }
success() { echo -e "${GREEN}[OK]${NC}   $1"; }
warn()    { echo -e "${YELLOW}[WARN]${NC} $1"; }
error()   { echo -e "${RED}[ERR]${NC}  $1"; }
step() {
    echo ""
    echo -e "${BOLD}${BLUE}==> $1${NC}"
}

# =========================
# Helpers binaires
# =========================
find_bin() {
    local cmd="$1"
    shift || true

    local found=""
    found="$(command -v "$cmd" 2>/dev/null || true)"

    if [[ -n "$found" && -x "$found" ]]; then
        echo "$found"
        return 0
    fi

    for p in "$@"; do
        if [[ -x "$p" ]]; then
            echo "$p"
            return 0
        fi
    done

    return 1
}

require_bin() {
    local value="$1"
    local name="$2"

    if [[ -z "$value" ]]; then
        error "Binaire requis introuvable : $name"
        exit 1
    fi
}

# =========================
# Vérifications préalables
# =========================
step "Vérifications préalables"

if [[ $EUID -ne 0 ]]; then
    error "Ce script doit être lancé avec sudo ou en root."
    exit 1
fi
success "Exécution en root confirmée"

TARGET_USER="${SUDO_USER:-}"
if [[ -z "${TARGET_USER}" || "${TARGET_USER}" == "root" ]]; then
    error "Impossible de déterminer l'utilisateur cible."
    info "Lance ce script avec sudo depuis ton utilisateur habituel."
    exit 1
fi
success "Utilisateur cible détecté : ${TARGET_USER}"

GROUPADD_BIN="$(find_bin groupadd /usr/sbin/groupadd /sbin/groupadd /usr/bin/groupadd || true)"
USERMOD_BIN="$(find_bin usermod /usr/sbin/usermod /sbin/usermod /usr/bin/usermod || true)"
APTGET_BIN="$(find_bin apt-get /usr/bin/apt-get /bin/apt-get || true)"

require_bin "${GROUPADD_BIN}" "groupadd"
require_bin "${USERMOD_BIN}" "usermod"
require_bin "${APTGET_BIN}" "apt-get"
success "Binaires système détectés"

# =========================
# Installation ACL
# =========================
step "Installation des outils ACL"

"${APTGET_BIN}" update
"${APTGET_BIN}" install -y "${ACL_PACKAGE}"

SETFACL_BIN="$(find_bin setfacl /usr/bin/setfacl /bin/setfacl || true)"
GETFACL_BIN="$(find_bin getfacl /usr/bin/getfacl /bin/getfacl || true)"

require_bin "${SETFACL_BIN}" "setfacl"
require_bin "${GETFACL_BIN}" "getfacl"
success "ACL installé et binaires détectés"

# =========================
# Groupe + utilisateur
# =========================
step "Préparation du groupe partagé"

"${GROUPADD_BIN}" -f "${GROUP_NAME}"
"${USERMOD_BIN}" -aG "${GROUP_NAME}" "${TARGET_USER}"
success "Groupe ${GROUP_NAME} prêt et utilisateur ${TARGET_USER} ajouté"

# =========================
# Répertoire partagé
# =========================
step "Préparation du répertoire partagé"

mkdir -p "${BASE_DIR}"
chown root:"${GROUP_NAME}" "${BASE_DIR}"
chmod 2775 "${BASE_DIR}"

"${SETFACL_BIN}" -m g:"${GROUP_NAME}":rwx "${BASE_DIR}"
"${SETFACL_BIN}" -m o::--- "${BASE_DIR}"
"${SETFACL_BIN}" -d -m g:"${GROUP_NAME}":rwx "${BASE_DIR}"
"${SETFACL_BIN}" -d -m o::--- "${BASE_DIR}"
success "Droits appliqués sur ${BASE_DIR}"

# =========================
# Vérifications
# =========================
step "Vérifications finales"

ls -ld "${BASE_DIR}"
"${GETFACL_BIN}" "${BASE_DIR}"
id "${TARGET_USER}"

echo ""
warn "L'ajout au groupe ne s'applique pas toujours au shell courant."
info "Reconnecte-toi ou lance : newgrp ${GROUP_NAME}"
info "Ensuite, ton CLI pourra créer des dossiers dans ${BASE_DIR} sans sudo."