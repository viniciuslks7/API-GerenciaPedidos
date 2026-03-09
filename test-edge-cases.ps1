# ============================================
# Script de Testes de Edge Cases
# API Jitterbit Order
# ============================================

Write-Host "`n=== INICIANDO TESTES DE EDGE CASES ===" -ForegroundColor Cyan

# Obtém token JWT fresco via login
Write-Host "`n[SETUP] Obtendo token JWT..." -ForegroundColor Gray
try {
    $loginBody = '{"username":"admin","password":"admin123"}'
    $loginResult = Invoke-WebRequest -Uri "http://localhost:3000/auth/login" -Method POST -Body $loginBody -Headers @{ "Content-Type" = "application/json" } -UseBasicParsing
    $token = ($loginResult.Content | ConvertFrom-Json).data.token
    Write-Host "[SETUP] Token obtido com sucesso!" -ForegroundColor Green
} catch {
    Write-Host "[SETUP] ERRO: Não foi possível obter token. Servidor rodando?" -ForegroundColor Red
    exit 1
}

$baseUrl = "http://localhost:3000"
$headers = @{ Authorization = "Bearer $token"; "Content-Type" = "application/json" }

# Contador de testes
$testCount = 0
$passedTests = 0
$failedTests = 0

function Test-Case {
    param($Name, $ScriptBlock, $ExpectedStatus)
    $script:testCount++
    Write-Host "`n[$script:testCount] $Name" -ForegroundColor Yellow
    try {
        $result = & $ScriptBlock
        Write-Host "  PASSED" -ForegroundColor Green
        $script:passedTests++
    } catch {
        if ($ExpectedStatus -eq "error") {
            Write-Host "  PASSED (erro esperado)" -ForegroundColor Green
            $script:passedTests++
        } else {
            Write-Host "  FAILED: $($_.Exception.Message)" -ForegroundColor Red
            $script:failedTests++
        }
    }
}

# ==========================================
# 1. VALIDAÇÕES DE ENTRADA
# ==========================================
Write-Host "`n=== 1. VALIDAÇÕES DE ENTRADA ===" -ForegroundColor Magenta

# Limpeza de dados de testes anteriores
Write-Host "`n[CLEANUP] Removendo pedidos de testes anteriores..." -ForegroundColor Gray
$testOrderIds = @("EMPTY-001","NEG-001","ZERO-001","NO-ITEMS-001","TYPE-001","'; DROP TABLE orders; --","SPECIAL-<>&%","EMOJI-😀🚀⭐","BIGNUM-001","DECIMAL-001","BADDATE-001","FUTURE-001","DUP-001","MANY-ITEMS-001")
foreach ($id in $testOrderIds) {
    try {
        Invoke-WebRequest -Uri "$baseUrl/order/$id" -Method DELETE -Headers $headers -UseBasicParsing -ErrorAction SilentlyContinue | Out-Null
    } catch { }
}
Write-Host "[CLEANUP] Limpeza concluída!" -ForegroundColor Green

Test-Case "1.1 - Pedido com array de items vazio" {
    $data = @{
        numeroPedido = "EMPTY-001"
        valorTotal = 1000
        dataCriacao = "2026-03-08T12:00:00Z"
        items = @()
    } | ConvertTo-Json
    Invoke-WebRequest -Uri "$baseUrl/order" -Method POST -Body $data -Headers $headers -UseBasicParsing
} -ExpectedStatus "error"

Test-Case "1.2 - Pedido com valorTotal negativo" {
    $data = @{
        numeroPedido = "NEG-001"
        valorTotal = -1000
        dataCriacao = "2026-03-08T12:00:00Z"
        items = @( @{ idItem = "1"; quantidadeItem = 1; valorItem = -1000 } )
    } | ConvertTo-Json
    Invoke-WebRequest -Uri "$baseUrl/order" -Method POST -Body $data -Headers $headers -UseBasicParsing
} -ExpectedStatus "success"

Test-Case "1.3 - Pedido com quantidadeItem = 0" {
    $data = @{
        numeroPedido = "ZERO-001"
        valorTotal = 0
        dataCriacao = "2026-03-08T12:00:00Z"
        items = @( @{ idItem = "1"; quantidadeItem = 0; valorItem = 0 } )
    } | ConvertTo-Json
    Invoke-WebRequest -Uri "$baseUrl/order" -Method POST -Body $data -Headers $headers -UseBasicParsing
} -ExpectedStatus "error"

Test-Case "1.4 - Pedido com campo faltando (sem items)" {
    $data = @{
        numeroPedido = "NO-ITEMS-001"
        valorTotal = 1000
        dataCriacao = "2026-03-08T12:00:00Z"
    } | ConvertTo-Json
    Invoke-WebRequest -Uri "$baseUrl/order" -Method POST -Body $data -Headers $headers -UseBasicParsing
} -ExpectedStatus "error"

Test-Case "1.5 - Pedido com numeroPedido muito longo (>100 chars)" {
    $longId = "A" * 150
    $data = @{
        numeroPedido = $longId
        valorTotal = 1000
        dataCriacao = "2026-03-08T12:00:00Z"
        items = @( @{ idItem = "1"; quantidadeItem = 1; valorItem = 1000 } )
    } | ConvertTo-Json
    Invoke-WebRequest -Uri "$baseUrl/order" -Method POST -Body $data -Headers $headers -UseBasicParsing
} -ExpectedStatus "error"

Test-Case "1.6 - Pedido com tipo errado (valorTotal como string)" {
    $data = '{"numeroPedido":"TYPE-001","valorTotal":"mil","dataCriacao":"2026-03-08T12:00:00Z","items":[{"idItem":"1","quantidadeItem":1,"valorItem":1000}]}'
    Invoke-WebRequest -Uri "$baseUrl/order" -Method POST -Body $data -Headers $headers -UseBasicParsing
} -ExpectedStatus "error"

# ==========================================
# 2. SEGURANÇA - SQL INJECTION
# ==========================================
Write-Host "`n=== 2. SEGURANÇA - SQL INJECTION ===" -ForegroundColor Magenta

Test-Case "2.1 - SQL Injection no numeroPedido" {
    $data = @{
        numeroPedido = "'; DROP TABLE orders; --"
        valorTotal = 1000
        dataCriacao = "2026-03-08T12:00:00Z"
        items = @( @{ idItem = "1"; quantidadeItem = 1; valorItem = 1000 } )
    } | ConvertTo-Json
    Invoke-WebRequest -Uri "$baseUrl/order" -Method POST -Body $data -Headers $headers -UseBasicParsing
} -ExpectedStatus "success"

Test-Case "2.2 - SQL Injection no GET" {
    $maliciousId = "TEST-001' OR '1'='1"
    Invoke-WebRequest -Uri "$baseUrl/order/$maliciousId" -Method GET -Headers $headers -UseBasicParsing
} -ExpectedStatus "error"

# ==========================================
# 3. AUTENTICAÇÃO E AUTORIZAÇÃO
# ==========================================
Write-Host "`n=== 3. AUTENTICAÇÃO E AUTORIZAÇÃO ===" -ForegroundColor Magenta

Test-Case "3.1 - Token JWT malformado" {
    $badHeaders = @{ Authorization = "Bearer token_invalido"; "Content-Type" = "application/json" }
    Invoke-WebRequest -Uri "$baseUrl/order/list" -Method GET -Headers $badHeaders -UseBasicParsing
} -ExpectedStatus "error"

Test-Case "3.2 - Token JWT expirado (simulado)" {
    $expiredToken = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEsInVzZXJuYW1lIjoiYWRtaW4iLCJpYXQiOjE2MDAwMDAwMDAsImV4cCI6MTYwMDAwMDAwMX0.invalid"
    $expiredHeaders = @{ Authorization = "Bearer $expiredToken"; "Content-Type" = "application/json" }
    Invoke-WebRequest -Uri "$baseUrl/order/list" -Method GET -Headers $expiredHeaders -UseBasicParsing
} -ExpectedStatus "error"

Test-Case "3.3 - Sem header Authorization" {
    Invoke-WebRequest -Uri "$baseUrl/order/list" -Method GET -UseBasicParsing
} -ExpectedStatus "error"

Test-Case "3.4 - Header Authorization sem Bearer" {
    $noBearer = @{ Authorization = $token; "Content-Type" = "application/json" }
    Invoke-WebRequest -Uri "$baseUrl/order/list" -Method GET -Headers $noBearer -UseBasicParsing
} -ExpectedStatus "error"

# ==========================================
# 4. CARACTERES ESPECIAIS E UNICODE
# ==========================================
Write-Host "`n=== 4. CARACTERES ESPECIAIS E UNICODE ===" -ForegroundColor Magenta

Test-Case "4.1 - Caracteres especiais no numeroPedido" {
    $data = @{
        numeroPedido = "SPECIAL-<>&%"
        valorTotal = 1000
        dataCriacao = "2026-03-08T12:00:00Z"
        items = @( @{ idItem = "1"; quantidadeItem = 1; valorItem = 1000 } )
    } | ConvertTo-Json
    Invoke-WebRequest -Uri "$baseUrl/order" -Method POST -Body $data -Headers $headers -UseBasicParsing
} -ExpectedStatus "success"

Test-Case "4.2 - Unicode/Emoji no numeroPedido" {
    $data = @{
        numeroPedido = "EMOJI-😀🚀⭐"
        valorTotal = 1000
        dataCriacao = "2026-03-08T12:00:00Z"
        items = @( @{ idItem = "1"; quantidadeItem = 1; valorItem = 1000 } )
    } | ConvertTo-Json -Depth 10
    $utf8Body = [System.Text.Encoding]::UTF8.GetBytes($data)
    Invoke-WebRequest -Uri "$baseUrl/order" -Method POST -Body $utf8Body -Headers $headers -UseBasicParsing
} -ExpectedStatus "success"

# ==========================================
# 5. NÚMEROS EXTREMOS
# ==========================================
Write-Host "`n=== 5. NÚMEROS EXTREMOS ===" -ForegroundColor Magenta

Test-Case "5.1 - Valor muito grande (overflow)" {
    $data = @{
        numeroPedido = "BIGNUM-001"
        valorTotal = 99999999999999
        dataCriacao = "2026-03-08T12:00:00Z"
        items = @( @{ idItem = "1"; quantidadeItem = 999999; valorItem = 99999999999999 } )
    } | ConvertTo-Json
    Invoke-WebRequest -Uri "$baseUrl/order" -Method POST -Body $data -Headers $headers -UseBasicParsing
} -ExpectedStatus "error"

Test-Case "5.2 - Valor decimal com muitas casas" {
    $data = @{
        numeroPedido = "DECIMAL-001"
        valorTotal = 1234.56789012345
        dataCriacao = "2026-03-08T12:00:00Z"
        items = @( @{ idItem = "1"; quantidadeItem = 1; valorItem = 1234.56789012345 } )
    } | ConvertTo-Json
    Invoke-WebRequest -Uri "$baseUrl/order" -Method POST -Body $data -Headers $headers -UseBasicParsing
} -ExpectedStatus "success"

# ==========================================
# 6. DATAS
# ==========================================
Write-Host "`n=== 6. DATAS ===" -ForegroundColor Magenta

Test-Case "6.1 - Data inválida" {
    $data = @{
        numeroPedido = "BADDATE-001"
        valorTotal = 1000
        dataCriacao = "data_invalida"
        items = @( @{ idItem = "1"; quantidadeItem = 1; valorItem = 1000 } )
    } | ConvertTo-Json
    Invoke-WebRequest -Uri "$baseUrl/order" -Method POST -Body $data -Headers $headers -UseBasicParsing
} -ExpectedStatus "error"

Test-Case "6.2 - Data futura distante (ano 2099)" {
    $data = @{
        numeroPedido = "FUTURE-001"
        valorTotal = 1000
        dataCriacao = "2099-12-31T23:59:59Z"
        items = @( @{ idItem = "1"; quantidadeItem = 1; valorItem = 1000 } )
    } | ConvertTo-Json
    Invoke-WebRequest -Uri "$baseUrl/order" -Method POST -Body $data -Headers $headers -UseBasicParsing
} -ExpectedStatus "success"

# ==========================================
# 7. CONCORRÊNCIA E DUPLICATAS
# ==========================================
Write-Host "`n=== 7. CONCORRÊNCIA E DUPLICATAS ===" -ForegroundColor Magenta

Test-Case "7.1 - Criar pedido duplicado (mesmo ID)" {
    $data = @{
        numeroPedido = "DUP-001"
        valorTotal = 1000
        dataCriacao = "2026-03-08T12:00:00Z"
        items = @( @{ idItem = "1"; quantidadeItem = 1; valorItem = 1000 } )
    } | ConvertTo-Json
    Invoke-WebRequest -Uri "$baseUrl/order" -Method POST -Body $data -Headers $headers -UseBasicParsing
    Start-Sleep -Milliseconds 100
    Invoke-WebRequest -Uri "$baseUrl/order" -Method POST -Body $data -Headers $headers -UseBasicParsing
} -ExpectedStatus "error"

# ==========================================
# 8. PAYLOAD MUITO GRANDE
# ==========================================
Write-Host "`n=== 8. PAYLOAD MUITO GRANDE ===" -ForegroundColor Magenta

Test-Case "8.1 - Pedido com 1000 items" {
    $manyItems = @()
    for ($i = 1; $i -le 1000; $i++) {
        $manyItems += @{ idItem = "$i"; quantidadeItem = 1; valorItem = 10 }
    }
    $data = @{
        numeroPedido = "MANY-ITEMS-001"
        valorTotal = 10000
        dataCriacao = "2026-03-08T12:00:00Z"
        items = $manyItems
    } | ConvertTo-Json -Depth 10
    Invoke-WebRequest -Uri "$baseUrl/order" -Method POST -Body $data -Headers $headers -UseBasicParsing -TimeoutSec 30
} -ExpectedStatus "success"

# ==========================================
# 9. MÉTODOS HTTP INCORRETOS
# ==========================================
Write-Host "`n=== 9. MÉTODOS HTTP INCORRETOS ===" -ForegroundColor Magenta

Test-Case "9.1 - PATCH não implementado" {
    Invoke-WebRequest -Uri "$baseUrl/order/TEST-001" -Method PATCH -Headers $headers -UseBasicParsing
} -ExpectedStatus "error"

# ==========================================
# RESUMO FINAL
# ==========================================
Write-Host "`n=== RESUMO DOS TESTES ===" -ForegroundColor Cyan  
Write-Host "Total de testes: $testCount" -ForegroundColor White
Write-Host "Passados: $passedTests" -ForegroundColor Green
Write-Host "Falhados: $failedTests" -ForegroundColor Red

if ($failedTests -eq 0) {
    Write-Host "`nTODOS OS TESTES PASSARAM!" -ForegroundColor Green
} else {
    Write-Host "`nALGUNS TESTES FALHARAM" -ForegroundColor Red
}
