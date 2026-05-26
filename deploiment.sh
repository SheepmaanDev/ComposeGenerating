#!/usr/bin/env bash
set -euo pipefail

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
# Variables fixes
# =========================


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
mask() {
    echo "$1" | sed 's/./*/g'
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

# =========================
# Vérifications préalables
# =========================
step "Vérifications préalables"

if [[ $EUID -ne 0 ]]; then
    error "Ce script doit être lancé en root."
    exit 1
fi
success "Exécution en root confirmée"

GROUPADD_BIN="$(find_bin groupadd /usr/sbin/groupadd /sbin/groupadd /usr/bin/groupadd || true)"
if [[ -z "${GROUPADD_BIN}" ]]; then
    error "groupadd n'est pas accessible dans le PATH."
    info "Installe ou réinstalle le paquet : apt install --reinstall -y passwd"
    info "Teste avec : /usr/sbin/groupadd --help"
    exit 1
fi
success "groupadd trouvé : ${GROUPADD_BIN}"

step "Mise à jour système & installation des outils pour CLI"
apt-get update && apt-get install acl -y
success "Système à jour & outils"

step "Création du groupe + ajout utilisateur courant"
"${GROUPADD_BIN}" composegen
"${USERMOD_BIN}" -aG composegen "$USER"
success "Groupe créé et utiisateur ajouté"

step "Création des répertoires + application des droits"
mkdir -p /srv/docker
chown root:composegen /srv/docker
chmod 2775 /srv/docker
"${SETFACL_BIN}" -m g:composegen:rwx /srv/docker
"${SETFACL_BIN}" -d -m g:composegen:rwx /srv/docker
"${SETFACL_BIN}" -d -m o::rowx /srv/docker
success "Répertoires et droits"

echo "=== Vérification ==="
ls -ld /srv/docker
getfacl /srv/docker
id "$USER"

echo "Reconnecte-toi ou lance newgrp composegen avant d'utiliser le CLI"