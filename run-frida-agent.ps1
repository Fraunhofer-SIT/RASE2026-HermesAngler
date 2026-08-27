param(
  [string]$DeviceId = '<your-device-udid>',
  [string]$BundleId = '<your.bundle.id>',
  [string]$AgentSource = '.\core\frida-agent.js',
  [string]$AgentBundle = '.\core\frida-agent.bundle.js',
  [string]$LogDirectory = '.\logs',
  [string]$LogFile
)

$ErrorActionPreference = 'Stop'

$scriptRoot = Split-Path -Parent $PSCommandPath
Set-Location $scriptRoot

if (-not $LogFile) {
  $timestamp = Get-Date -Format 'yyyyMMdd-HHmmss'
  $LogFile = Join-Path $LogDirectory ("frida-$timestamp.log")
}

$resolvedLogDirectory = Split-Path -Parent $LogFile
if ([string]::IsNullOrWhiteSpace($resolvedLogDirectory)) {
  $resolvedLogDirectory = $LogDirectory
}

New-Item -ItemType Directory -Force -Path $resolvedLogDirectory | Out-Null

"[$(Get-Date -Format o)] Building $AgentBundle from $AgentSource" | Tee-Object -FilePath $LogFile -Append
& frida-compile $AgentSource -o $AgentBundle 2>&1 | Tee-Object -FilePath $LogFile -Append
if ($LASTEXITCODE -ne 0) {
  exit $LASTEXITCODE
}

"[$(Get-Date -Format o)] Launching $BundleId on $DeviceId" | Tee-Object -FilePath $LogFile -Append
& frida -D $DeviceId -f $BundleId -l $AgentBundle 2>&1 | Tee-Object -FilePath $LogFile -Append
exit $LASTEXITCODE