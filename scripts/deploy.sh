#!/bin/bash

#######################################################
# Mezo PaaS Deployment Script
#
# Usage:
#   ./scripts/deploy.sh <service>
#   ./scripts/deploy.sh all
#
# Services: backend, worker, proxy, all
#######################################################

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Get the script directory (needed for config file)
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"

# ============================================
# CONFIGURATION
# ============================================
# Option 1: Create scripts/deploy.config with your settings
# Option 2: Set environment variables before running
# Option 3: Edit the defaults below
# ============================================

# Default values (override in deploy.config or environment)
BACKEND_HOST="${BACKEND_HOST:-}"
WORKER_HOST="${WORKER_HOST:-}"
PROXY_HOST="${PROXY_HOST:-}"
SSH_USER="${SSH_USER:-ubuntu}"
REMOTE_DIR="${REMOTE_DIR:-~/mezo-deploy}"
GIT_BRANCH="${GIT_BRANCH:-master}"

# Load config file if it exists
CONFIG_FILE="$SCRIPT_DIR/deploy.config"
if [ -f "$CONFIG_FILE" ]; then
    source "$CONFIG_FILE"
fi

# ============================================
# END CONFIGURATION
# ============================================

# PEM file locations
BACKEND_PEM="$PROJECT_ROOT/backend/mezo-keypair.pem"
WORKER_PEM="$PROJECT_ROOT/worker/mezo-keypair.pem"
PROXY_PEM="$PROJECT_ROOT/proxy/mezo-keypair.pem"

# Print banner
print_banner() {
    echo -e "${BLUE}"
    echo "╔═══════════════════════════════════════════════════════╗"
    echo "║           Mezo PaaS Deployment Script                 ║"
    echo "╚═══════════════════════════════════════════════════════╝"
    echo -e "${NC}"
}

# Print step
print_step() {
    echo -e "${YELLOW}▶ $1${NC}"
}

# Print success
print_success() {
    echo -e "${GREEN}✓ $1${NC}"
}

# Print error
print_error() {
    echo -e "${RED}✗ $1${NC}"
}

# Check if host is configured
check_host() {
    local host=$1
    local service=$2
    if [ -z "$host" ]; then
        print_error "$service host is not configured!"
        echo "Please edit this script and set ${service^^}_HOST variable"
        echo "Get the EC2 Public DNS from AWS Console → EC2 → Instances"
        exit 1
    fi
}

# Check if PEM file exists
check_pem() {
    local pem=$1
    local service=$2
    if [ ! -f "$pem" ]; then
        print_error "PEM file not found: $pem"
        exit 1
    fi
    # Fix permissions
    chmod 400 "$pem" 2>/dev/null || true
}

# Deploy a service
deploy_service() {
    local service=$1
    local host=$2
    local pem=$3
    local run_migrations=$4

    echo ""
    echo -e "${BLUE}════════════════════════════════════════════════════════${NC}"
    echo -e "${BLUE}  Deploying: ${service^^}${NC}"
    echo -e "${BLUE}════════════════════════════════════════════════════════${NC}"
    echo ""

    check_host "$host" "$service"
    check_pem "$pem" "$service"

    print_step "Connecting to $host..."

    # Build the remote commands
    local commands="
        echo '→ Navigating to project directory...'
        cd $REMOTE_DIR/$service || exit 1

        echo '→ Pulling latest changes from $GIT_BRANCH...'
        git fetch origin
        git checkout $GIT_BRANCH
        git pull origin $GIT_BRANCH

        echo '→ Installing dependencies...'
        npm install --production=false
    "

    # Add migrations for backend
    if [ "$run_migrations" = "true" ]; then
        commands="$commands
        echo '→ Running database migrations...'
        npx prisma generate
        npx prisma migrate deploy || echo 'Migration warning (may be ok if no new migrations)'
        "
    fi

    # Add restart command
    commands="$commands
        echo '→ Restarting service...'
        pm2 restart $service || pm2 restart all

        echo '→ Checking status...'
        pm2 list

        echo ''
        echo '✓ Deployment complete!'
    "

    # Execute remote commands
    ssh -i "$pem" -o StrictHostKeyChecking=no "$SSH_USER@$host" "$commands"

    if [ $? -eq 0 ]; then
        print_success "$service deployed successfully!"
    else
        print_error "$service deployment failed!"
        exit 1
    fi
}

# Deploy backend
deploy_backend() {
    deploy_service "backend" "$BACKEND_HOST" "$BACKEND_PEM" "true"
}

# Deploy worker
deploy_worker() {
    deploy_service "worker" "$WORKER_HOST" "$WORKER_PEM" "false"
}

# Deploy proxy
deploy_proxy() {
    deploy_service "proxy" "$PROXY_HOST" "$PROXY_PEM" "false"
}

# Deploy all services
deploy_all() {
    echo ""
    print_step "Deploying all services..."
    echo ""

    deploy_backend
    deploy_worker
    deploy_proxy

    echo ""
    echo -e "${GREEN}════════════════════════════════════════════════════════${NC}"
    echo -e "${GREEN}  All services deployed successfully!${NC}"
    echo -e "${GREEN}════════════════════════════════════════════════════════${NC}"
    echo ""
}

# Show logs
show_logs() {
    local service=$1
    local host=$2
    local pem=$3

    check_host "$host" "$service"
    check_pem "$pem" "$service"

    print_step "Fetching logs for $service..."
    ssh -i "$pem" -o StrictHostKeyChecking=no "$SSH_USER@$host" "pm2 logs $service --lines 100"
}

# SSH into service
ssh_into() {
    local service=$1
    local host=$2
    local pem=$3

    check_host "$host" "$service"
    check_pem "$pem" "$service"

    print_step "Connecting to $service..."
    ssh -i "$pem" -o StrictHostKeyChecking=no "$SSH_USER@$host"
}

# Show status
show_status() {
    local service=$1
    local host=$2
    local pem=$3

    check_host "$host" "$service"
    check_pem "$pem" "$service"

    print_step "Checking status of $service..."
    ssh -i "$pem" -o StrictHostKeyChecking=no "$SSH_USER@$host" "pm2 list && echo '' && free -h && echo '' && df -h /"
}

# Print usage
print_usage() {
    echo "Usage: $0 <command> [service]"
    echo ""
    echo "Commands:"
    echo "  deploy <service>   Deploy a service (backend, worker, proxy, all)"
    echo "  logs <service>     Show logs for a service"
    echo "  ssh <service>      SSH into a service"
    echo "  status <service>   Show status of a service"
    echo ""
    echo "Examples:"
    echo "  $0 deploy backend  # Deploy backend only"
    echo "  $0 deploy all      # Deploy all services"
    echo "  $0 logs worker     # View worker logs"
    echo "  $0 ssh proxy       # SSH into proxy server"
    echo "  $0 status backend  # Check backend status"
    echo ""
    echo "Quick deploy (legacy):"
    echo "  $0 backend         # Same as: $0 deploy backend"
    echo "  $0 all             # Same as: $0 deploy all"
}

# Get host and pem for service
get_service_config() {
    local service=$1
    case $service in
        backend)
            echo "$BACKEND_HOST|$BACKEND_PEM"
            ;;
        worker)
            echo "$WORKER_HOST|$WORKER_PEM"
            ;;
        proxy)
            echo "$PROXY_HOST|$PROXY_PEM"
            ;;
        *)
            echo ""
            ;;
    esac
}

# Main
main() {
    print_banner

    # Check if hosts are configured
    if [ -z "$BACKEND_HOST" ] && [ -z "$WORKER_HOST" ] && [ -z "$PROXY_HOST" ]; then
        print_error "No EC2 hosts configured!"
        echo ""
        echo "Please edit this script and configure the host variables:"
        echo "  BACKEND_HOST, WORKER_HOST, PROXY_HOST"
        echo ""
        echo "Get the EC2 Public DNS from:"
        echo "  AWS Console → EC2 → Instances → Select Instance → Public IPv4 DNS"
        echo ""
        exit 1
    fi

    local command=$1
    local service=$2

    # Handle legacy single-argument usage
    if [ -z "$service" ]; then
        case $command in
            backend|worker|proxy|all)
                service=$command
                command="deploy"
                ;;
        esac
    fi

    case $command in
        deploy)
            case $service in
                backend) deploy_backend ;;
                worker) deploy_worker ;;
                proxy) deploy_proxy ;;
                all) deploy_all ;;
                *)
                    print_error "Unknown service: $service"
                    print_usage
                    exit 1
                    ;;
            esac
            ;;
        logs)
            config=$(get_service_config "$service")
            if [ -z "$config" ]; then
                print_error "Unknown service: $service"
                exit 1
            fi
            IFS='|' read -r host pem <<< "$config"
            show_logs "$service" "$host" "$pem"
            ;;
        ssh)
            config=$(get_service_config "$service")
            if [ -z "$config" ]; then
                print_error "Unknown service: $service"
                exit 1
            fi
            IFS='|' read -r host pem <<< "$config"
            ssh_into "$service" "$host" "$pem"
            ;;
        status)
            config=$(get_service_config "$service")
            if [ -z "$config" ]; then
                print_error "Unknown service: $service"
                exit 1
            fi
            IFS='|' read -r host pem <<< "$config"
            show_status "$service" "$host" "$pem"
            ;;
        help|--help|-h)
            print_usage
            ;;
        *)
            print_error "Unknown command: $command"
            print_usage
            exit 1
            ;;
    esac
}

# Run main with all arguments
main "$@"
