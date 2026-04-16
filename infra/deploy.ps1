<#
.SYNOPSIS
    Deploys the Zava storefront Azure infrastructure and configures GitHub OIDC for CI/CD.

.DESCRIPTION
    Run this once to set up:
    1. Azure Container Apps + PostgreSQL via Bicep
    2. Entra ID app registration + federated credential for GitHub Actions OIDC
    3. Outputs the GitHub secrets you need to configure (no secrets stored in the repo)

.PARAMETER GitHubRepo
    GitHub repo in owner/name format (e.g. myorg/zava-storefront)

.PARAMETER SubscriptionId
    Azure subscription ID (required)

.PARAMETER TenantId
    Azure tenant ID (optional — omit to use default tenant)

.PARAMETER Location
    Azure region (default: swedencentral)

.EXAMPLE
    .\deploy.ps1 -GitHubRepo "myorg/zava-storefront" -SubscriptionId "00000000-0000-0000-0000-000000000000"
#>
param(
    [Parameter(Mandatory)]
    [string]$GitHubRepo,

    [Parameter(Mandatory)]
    [string]$SubscriptionId,

    [string]$TenantId,
    [string]$ResourceGroup = "Zava",
    [string]$Location = "swedencentral"
)

$ErrorActionPreference = "Stop"

Write-Host "`n=== Zava Azure Deployment ===" -ForegroundColor Cyan

# ---- Login & set subscription ----
Write-Host "`n[1/5] Logging in to Azure..." -ForegroundColor Yellow
if ($TenantId) {
    az login --tenant $TenantId --output none
} else {
    az login --output none
}
az account set --subscription $SubscriptionId

# ---- Ensure resource group exists ----
Write-Host "`n[2/5] Creating resource group '$ResourceGroup' in '$Location'..." -ForegroundColor Yellow
az group create --name $ResourceGroup --location $Location --output none

# ---- Generate secrets ----
$postgresPassword = -join ((48..57) + (65..90) + (97..122) | Get-Random -Count 24 | ForEach-Object { [char]$_ })
$jwtSecret = -join ((48..57) + (65..90) + (97..122) | Get-Random -Count 32 | ForEach-Object { [char]$_ })

# ---- Deploy Bicep ----
Write-Host "`n[3/5] Deploying Azure infrastructure (this takes 3-5 minutes)..." -ForegroundColor Yellow
$deployment = az deployment group create `
    --resource-group $ResourceGroup `
    --template-file "$PSScriptRoot/main.bicep" `
    --parameters postgresPassword=$postgresPassword jwtSecret=$jwtSecret `
    --query "properties.outputs" `
    --output json | ConvertFrom-Json

$webUrl = $deployment.webUrl.value
$pgHost = $deployment.postgresHost.value

Write-Host "  Web URL:         $webUrl" -ForegroundColor Green
Write-Host "  PostgreSQL host: $pgHost" -ForegroundColor Green

# ---- Set up Entra ID app + OIDC federation for GitHub Actions ----
Write-Host "`n[4/5] Configuring Entra ID app for GitHub Actions OIDC..." -ForegroundColor Yellow

$appName = "zava-github-deploy"

# Create app registration
$appId = az ad app create --display-name $appName --query appId --output tsv

# Create service principal
az ad sp create --id $appId --output none 2>$null

# Assign Contributor role on the resource group
$spObjectId = az ad sp show --id $appId --query id --output tsv
az role assignment create `
    --assignee-object-id $spObjectId `
    --assignee-principal-type ServicePrincipal `
    --role Contributor `
    --scope "/subscriptions/$SubscriptionId/resourceGroups/$ResourceGroup" `
    --output none

# Create federated credential for the live-demo branch
$federatedCredential = @{
    name        = "github-live-demo"
    issuer      = "https://token.actions.githubusercontent.com"
    subject     = "repo:${GitHubRepo}:ref:refs/heads/live-demo"
    audiences   = @("api://AzureADTokenExchange")
    description = "GitHub Actions OIDC for live-demo branch"
} | ConvertTo-Json -Compress

$federatedCredential | az ad app federated-credential create --id $appId --parameters "@-" --output none

# Get tenant ID
$tenantId = az account show --query tenantId --output tsv

# ---- Summary ----
Write-Host "`n[5/5] Setup complete!" -ForegroundColor Green
Write-Host "`n=== Add these GitHub repository secrets ===" -ForegroundColor Cyan
Write-Host "  (Settings > Secrets and variables > Actions > New repository secret)`n"
Write-Host "  AZURE_CLIENT_ID       = $appId"
Write-Host "  AZURE_TENANT_ID       = $tenantId"
Write-Host "  AZURE_SUBSCRIPTION_ID = $SubscriptionId"
Write-Host ""
Write-Host "=== Deployed app ===" -ForegroundColor Cyan
Write-Host "  Web URL: $webUrl"
Write-Host ""
Write-Host "=== Next steps ===" -ForegroundColor Cyan
Write-Host "  1. Add the three GitHub secrets listed above"
Write-Host "  2. Make ghcr.io packages public (or add registry credentials)"
Write-Host "     GitHub > Packages > zava-storefront/api > Settings > Change visibility"
Write-Host "     GitHub > Packages > zava-storefront/web > Settings > Change visibility"
Write-Host "  3. Push to 'live-demo' branch to trigger the first deployment"
Write-Host "  4. After first deploy, seed the database:"
Write-Host "     az containerapp exec -n zava-api -g $ResourceGroup --command '/bin/sh'"
Write-Host "     Then run: RUN_SEED=true npx tsx prisma/seed.ts"
Write-Host ""
Write-Host "=== Secrets (save these somewhere safe - NOT in the repo!) ===" -ForegroundColor Red
Write-Host "  PostgreSQL password: $postgresPassword"
Write-Host "  JWT secret:          $jwtSecret"
