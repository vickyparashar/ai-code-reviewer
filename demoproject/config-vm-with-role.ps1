#Login-AzureRmAccount
#$PSVersionTable.PSVersion
param(
    # The name of environment 
    [Parameter(Mandatory = $false)]
    [string]$env = "",
    # The name of target groups  
    [Parameter(Mandatory = $false)]
    [string]$group = "",
    # The base path of playbooks
    [Parameter(Mandatory = $false)]
    [string]$playbookpath= "",
    # The base path of playbooks
    [Parameter(Mandatory = $false)]
    [string]$logs="False"
)
$inventorytext = Get-Content -ErrorAction stop "$playbookpath/environments/$env/inventory"

if ($logs -eq "False")
{
    ansible-playbook -v `
    -i "$playbookpath/environments/$env/inventory" `
    "$playbookpath/$group.yaml"  `
    -e ansible_ssh_common_args='"-o StrictHostKeyChecking=no"' `
    -e "env=$env" `
    -e "logs=$logs" 
  } else {
    ansible-playbook  `
    -i "$playbookpath/environments/$env/inventory" `
    "$playbookpath/$group.yaml"  `
    -e ansible_ssh_common_args='"-o StrictHostKeyChecking=no"' `
    -e "env=$env" `
    -e "logs=$logs" 
}

$exitCode = $LastExitCode
if ($exitCode -ne 0) {
    Write-Error "Ansible playbook failed with exit code $exitCode"
    if ($Error.Count -gt 0) {
      Write-Host "Latest Error: $($Error[0].Exception.Message)"
    }
    Write-Host "Ansible playbook with exit code $exitCode"
    exit $exitCode
}
else
{
    Write-Output "Success!"
}

