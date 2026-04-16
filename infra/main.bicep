@description('Azure region for all resources')
param location string = resourceGroup().location

@secure()
@description('PostgreSQL administrator password')
param postgresPassword string

@secure()
@description('JWT signing secret for the API')
param jwtSecret string

@description('GHCR image prefix, e.g. ghcr.io/owner/zava-storefront')
param imagePrefix string = ''

@description('Image tag to deploy')
param imageTag string = 'latest'

// ---- Naming ----
var suffix = uniqueString(resourceGroup().id)

// ---- Compute images (placeholder for initial deploy before first CI push) ----
var apiImage = empty(imagePrefix)
  ? 'mcr.microsoft.com/k8se/quickstart:latest'
  : '${imagePrefix}/api:${imageTag}'
var webImage = empty(imagePrefix)
  ? 'mcr.microsoft.com/k8se/quickstart:latest'
  : '${imagePrefix}/web:${imageTag}'

// ---- Log Analytics (required by Container Apps) ----
resource logAnalytics 'Microsoft.OperationalInsights/workspaces@2022-10-01' = {
  name: 'zava-logs-${suffix}'
  location: location
  properties: {
    sku: { name: 'PerGB2018' }
    retentionInDays: 30
  }
}

// ---- Container Apps Environment ----
resource containerEnv 'Microsoft.App/managedEnvironments@2024-03-01' = {
  name: 'zava-env'
  location: location
  properties: {
    appLogsConfiguration: {
      destination: 'log-analytics'
      logAnalyticsConfiguration: {
        customerId: logAnalytics.properties.customerId
        sharedKey: logAnalytics.listKeys().primarySharedKey
      }
    }
    workloadProfiles: [
      {
        name: 'Consumption'
        workloadProfileType: 'Consumption'
      }
      {
        name: 'Dedicated-D4'
        workloadProfileType: 'D4'
        minimumCount: 0
        maximumCount: 1
      }
    ]
  }
}

// ---- PostgreSQL Flexible Server ----
resource postgres 'Microsoft.DBforPostgreSQL/flexibleServers@2023-12-01-preview' = {
  name: 'zava-pg-${suffix}'
  location: location
  sku: {
    name: 'Standard_B1ms'
    tier: 'Burstable'
  }
  properties: {
    version: '16'
    administratorLogin: 'zavaadmin'
    administratorLoginPassword: postgresPassword
    storage: { storageSizeGB: 32 }
    backup: { backupRetentionDays: 7 }
  }
}

resource database 'Microsoft.DBforPostgreSQL/flexibleServers/databases@2023-12-01-preview' = {
  parent: postgres
  name: 'zava'
}

// Allow Azure services (Container Apps) to connect
resource pgFirewall 'Microsoft.DBforPostgreSQL/flexibleServers/firewallRules@2023-12-01-preview' = {
  parent: postgres
  name: 'AllowAzureServices'
  properties: {
    startIpAddress: '0.0.0.0'
    endIpAddress: '0.0.0.0'
  }
}

// ---- API Container App (internal ingress only) ----
resource apiApp 'Microsoft.App/containerApps@2024-03-01' = {
  name: 'zava-api'
  location: location
  properties: {
    managedEnvironmentId: containerEnv.id
    configuration: {
      secrets: [
        {
          name: 'database-url'
          value: 'postgresql://zavaadmin:${postgresPassword}@${postgres.properties.fullyQualifiedDomainName}:5432/zava?sslmode=require'
        }
        { name: 'jwt-secret', value: jwtSecret }
      ]
      ingress: {
        external: false
        targetPort: 3001
      }
    }
    template: {
      containers: [
        {
          name: 'zava-api'
          image: apiImage
          resources: {
            cpu: json('0.25')
            memory: '0.5Gi'
          }
          env: [
            { name: 'DATABASE_URL', secretRef: 'database-url' }
            { name: 'JWT_SECRET', secretRef: 'jwt-secret' }
            { name: 'CORS_ORIGIN', value: 'https://zava-web.${containerEnv.properties.defaultDomain}' }
            { name: 'PORT', value: '3001' }
            { name: 'NODE_ENV', value: 'production' }
          ]
          probes: [
            {
              type: 'Liveness'
              httpGet: { path: '/api/health', port: 3001 }
              initialDelaySeconds: 10
              periodSeconds: 30
            }
            {
              type: 'Readiness'
              httpGet: { path: '/api/health', port: 3001 }
              initialDelaySeconds: 5
              periodSeconds: 10
              failureThreshold: 3
            }
          ]
        }
      ]
      scale: {
        minReplicas: 1
        maxReplicas: 1
      }
    }
  }
}

// ---- Web Container App (external ingress — public URL) ----
resource webApp 'Microsoft.App/containerApps@2024-03-01' = {
  name: 'zava-web'
  location: location
  properties: {
    managedEnvironmentId: containerEnv.id
    configuration: {
      ingress: {
        external: true
        targetPort: 80
      }
    }
    template: {
      containers: [
        {
          name: 'zava-web'
          image: webImage
          resources: {
            cpu: json('0.25')
            memory: '0.5Gi'
          }
          env: [
            { name: 'API_URL', value: 'http://zava-api' }
            { name: 'API_HOST', value: 'zava-api' }
          ]
          probes: [
            {
              type: 'Liveness'
              httpGet: { path: '/', port: 80 }
              initialDelaySeconds: 5
              periodSeconds: 30
            }
            {
              type: 'Readiness'
              httpGet: { path: '/', port: 80 }
              initialDelaySeconds: 3
              periodSeconds: 10
              failureThreshold: 3
            }
          ]
        }
      ]
      scale: {
        minReplicas: 1
        maxReplicas: 2
      }
    }
  }
}

// ---- Outputs ----
output webUrl string = 'https://${webApp.properties.configuration.ingress.fqdn}'
output postgresHost string = postgres.properties.fullyQualifiedDomainName
