# Script PowerShell para criar atalho na área de trabalho do Windows
# Para executar: Clique com botão direito > "Executar com PowerShell"

# Verificar se o script está sendo executado como administrador
$isAdmin = ([Security.Principal.WindowsPrincipal] [Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)
if (-not $isAdmin) {
    Write-Host "⚠️  Este script precisa ser executado como administrador!" -ForegroundColor Yellow
    Write-Host "Clique com botão direito e selecione 'Executar como administrador'" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Pressione qualquer tecla para sair..." -ForegroundColor Gray
    $null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
    exit 1
}

try {
    # Caminho do script batch
    $scriptPath = "C:\lotofacil\lotofy-start.bat"
    
    # Verificar se o script batch existe
    if (-not (Test-Path $scriptPath)) {
        Write-Host "❌ Script não encontrado em: $scriptPath" -ForegroundColor Red
        Write-Host "Certifique-se de que o sistema está instalado em C:\lotofacil" -ForegroundColor Yellow
        Write-Host ""
        Write-Host "Pressione qualquer tecla para sair..." -ForegroundColor Gray
        $null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
        exit 1
    }
    
    # Caminho da área de trabalho do usuário atual
    $desktopPath = [Environment]::GetFolderPath("Desktop")
    
    # Caminho completo do atalho
    $shortcutPath = Join-Path $desktopPath "LOTOFY - Iniciar Sistema.lnk"
    
    # Criar o atalho
    $WshShell = New-Object -comObject WScript.Shell
    $shortcut = $WshShell.CreateShortcut($shortcutPath)
    $shortcut.TargetPath = $scriptPath
    $shortcut.WorkingDirectory = "C:\lotofacil"
    $shortcut.IconLocation = "shell32.dll,135"  # Ícone padrão de aplicativo
    $shortcut.Description = "Iniciar sistema LOTOFY"
    $shortcut.Save()
    
    Write-Host "✅ Atalho criado com sucesso!" -ForegroundColor Green
    Write-Host "Local: $shortcutPath" -ForegroundColor Gray
    Write-Host ""
    Write-Host "Agora você pode iniciar o sistema diretamente da área de trabalho!" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "Pressione qualquer tecla para sair..." -ForegroundColor Gray
    $null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
}
catch {
    Write-Host "❌ Erro ao criar atalho: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host ""
    Write-Host "Pressione qualquer tecla para sair..." -ForegroundColor Gray
    $null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
    exit 1
}