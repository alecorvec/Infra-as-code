#!/bin/bash

# Script de linting et formatting pour le frontend TypeScript
# Automatise les vérifications de qualité du code

set -e

# Configuration
FRONTEND_DIR="/Users/leopmartin/Documents/Tek/infraascode/Infra-as-code/frontend"

# Couleurs
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

log() {
    echo -e "${GREEN}[$(date +'%H:%M:%S')] $1${NC}"
}

error() {
    echo -e "${RED}[ERROR] $1${NC}"
    exit 1
}

warning() {
    echo -e "${YELLOW}[WARNING] $1${NC}"
}

info() {
    echo -e "${BLUE}[INFO] $1${NC}"
}

# Aller dans le répertoire frontend
cd "$FRONTEND_DIR"

# Fonction pour afficher l'aide
show_help() {
    echo -e "${BLUE}"
    echo "==========================================="
    echo "   LINTER & FORMATTER FRONTEND WORKFLOW"
    echo "==========================================="
    echo -e "${NC}"
    echo "Usage: $0 [COMMAND]"
    echo ""
    echo "Commandes disponibles:"
    echo "  check        - Vérification complète (lint + format + types)"
    echo "  fix          - Correction automatique (lint + format)"
    echo "  lint         - Linting ESLint seulement"
    echo "  lint:fix     - Correction automatique ESLint"
    echo "  format       - Formatting Prettier"
    echo "  format:check - Vérification du formatting"
    echo "  types        - Vérification TypeScript"
    echo "  install      - Installation des dépendances"
    echo "  clean        - Nettoyage des caches"
    echo "  help         - Afficher cette aide"
    echo ""
    echo "Exemples:"
    echo "  $0 check     # Vérification complète"
    echo "  $0 fix       # Correction automatique"
    echo "  $0 lint      # Linting seulement"
}

# Vérification des dépendances
check_dependencies() {
    log "🔍 Vérification des dépendances..."
    
    if [ ! -d "node_modules" ]; then
        warning "node_modules non trouvé. Installation des dépendances..."
        npm install
    fi
    
    # Vérifier que les outils sont installés
    if ! npx eslint --version &> /dev/null; then
        error "ESLint non trouvé. Exécutez: npm install"
    fi
    
    if ! npx prettier --version &> /dev/null; then
        error "Prettier non trouvé. Exécutez: npm install"
    fi
    
    if ! npx tsc --version &> /dev/null; then
        error "TypeScript non trouvé. Exécutez: npm install"
    fi
    
    log "✅ Dépendances vérifiées"
}

# Linting ESLint
run_lint() {
    log "🔍 Exécution du linting ESLint..."
    
    if npm run lint; then
        log "✅ Linting réussi"
        return 0
    else
        error "❌ Erreurs de linting détectées"
        return 1
    fi
}

# Correction automatique ESLint
run_lint_fix() {
    log "🔧 Correction automatique ESLint..."
    
    npm run lint:fix
    log "✅ Corrections ESLint appliquées"
}

# Formatting Prettier
run_format() {
    log "🎨 Formatting avec Prettier..."
    
    npm run format
    log "✅ Formatting appliqué"
}

# Vérification du formatting
run_format_check() {
    log "🎨 Vérification du formatting Prettier..."
    
    if npm run format:check; then
        log "✅ Formatting correct"
        return 0
    else
        error "❌ Fichiers mal formatés détectés"
        return 1
    fi
}

# Vérification TypeScript
run_type_check() {
    log "📝 Vérification des types TypeScript..."
    
    if npm run type-check; then
        log "✅ Types corrects"
        return 0
    else
        error "❌ Erreurs de types détectées"
        return 1
    fi
}

# Vérification complète
run_check() {
    log "🎯 Vérification complète du code..."
    
    local errors=0
    
    # Linting
    if ! run_lint; then
        ((errors++))
    fi
    
    # Format check
    if ! run_format_check; then
        ((errors++))
    fi
    
    # Type check
    if ! run_type_check; then
        ((errors++))
    fi
    
    if [ $errors -eq 0 ]; then
        log "🎉 Toutes les vérifications sont passées!"
        return 0
    else
        error "❌ $errors vérification(s) ont échoué"
        return 1
    fi
}

# Correction automatique complète
run_fix() {
    log "🔧 Correction automatique complète..."
    
    run_lint_fix
    run_format
    
    log "🎉 Corrections appliquées!"
}

# Installation des dépendances
run_install() {
    log "📦 Installation des dépendances..."
    
    npm install
    
    log "✅ Dépendances installées"
}

# Nettoyage
run_clean() {
    log "🧹 Nettoyage des caches..."
    
    # Nettoyer les caches ESLint
    rm -rf .eslintcache
    
    # Nettoyer les caches TypeScript
    rm -rf tsconfig.tsbuildinfo
    
    # Nettoyer node_modules/.cache
    rm -rf node_modules/.cache
    
    log "✅ Nettoyage terminé"
}

# Statistiques du code
show_stats() {
    log "📊 Statistiques du code..."
    
    echo -e "${BLUE}=== STATISTIQUES ===${NC}"
    echo "Fichiers TypeScript/JavaScript:"
    find src -name "*.ts" -o -name "*.tsx" -o -name "*.js" -o -name "*.jsx" | wc -l
    
    echo "Lignes de code:"
    find src -name "*.ts" -o -name "*.tsx" -o -name "*.js" -o -name "*.jsx" | xargs wc -l | tail -1
    
    echo "Fichiers CSS:"
    find src -name "*.css" | wc -l
    
    if command -v cloc &> /dev/null; then
        echo -e "${BLUE}=== DÉTAIL AVEC CLOC ===${NC}"
        cloc src --exclude-dir=node_modules
    fi
}

# Rapport de qualité
generate_report() {
    log "📋 Génération du rapport de qualité..."
    
    REPORT_FILE="quality-report-$(date +%Y%m%d-%H%M%S).txt"
    
    {
        echo "# Rapport de Qualité du Code Frontend"
        echo "Généré le: $(date)"
        echo "Répertoire: $(pwd)"
        echo ""
        
        echo "## Linting ESLint"
        if npm run lint &> /dev/null; then
            echo "✅ PASS"
        else
            echo "❌ FAIL"
            npm run lint 2>&1 || true
        fi
        
        echo ""
        echo "## Formatting Prettier"
        if npm run format:check &> /dev/null; then
            echo "✅ PASS"
        else
            echo "❌ FAIL"
            npm run format:check 2>&1 || true
        fi
        
        echo ""
        echo "## Types TypeScript"
        if npm run type-check &> /dev/null; then
            echo "✅ PASS"
        else
            echo "❌ FAIL"
            npm run type-check 2>&1 || true
        fi
        
        echo ""
        echo "## Statistiques"
        show_stats
        
    } > "$REPORT_FILE"
    
    log "📋 Rapport généré: $REPORT_FILE"
}

# Point d'entrée principal
main() {
    case "${1:-help}" in
        "check")
            check_dependencies
            run_check
            ;;
        "fix")
            check_dependencies
            run_fix
            ;;
        "lint")
            check_dependencies
            run_lint
            ;;
        "lint:fix")
            check_dependencies
            run_lint_fix
            ;;
        "format")
            check_dependencies
            run_format
            ;;
        "format:check")
            check_dependencies
            run_format_check
            ;;
        "types")
            check_dependencies
            run_type_check
            ;;
        "install")
            run_install
            ;;
        "clean")
            run_clean
            ;;
        "stats")
            show_stats
            ;;
        "report")
            generate_report
            ;;
        "help"|*)
            show_help
            ;;
    esac
}

main "$@"