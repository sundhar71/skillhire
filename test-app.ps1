#!/usr/bin/env pwsh

Write-Host "🚀 SkillHire Application Status Check" -ForegroundColor Green
Write-Host "=====================================" -ForegroundColor Green

# Check if servers are running
Write-Host "`n📡 Checking Server Status..." -ForegroundColor Yellow

# Check backend (port 5000)
try {
    $backendResponse = Invoke-WebRequest -Uri "http://localhost:5000/api/auth/register" -Method POST -ContentType "application/json" -Body '{"name":"StatusCheck","email":"status@test.com","password":"test123","role":"student"}' -ErrorAction Stop
    Write-Host "✅ Backend Server (Port 5000): RUNNING" -ForegroundColor Green
} catch {
    Write-Host "❌ Backend Server (Port 5000): NOT RESPONDING" -ForegroundColor Red
    Write-Host "   Error: $($_.Exception.Message)" -ForegroundColor Red
}

# Check frontend (port 3000)
try {
    $frontendResponse = Invoke-WebRequest -Uri "http://localhost:3000" -Method GET -ErrorAction Stop
    Write-Host "✅ Frontend Server (Port 3000): RUNNING" -ForegroundColor Green
} catch {
    Write-Host "❌ Frontend Server (Port 3000): NOT RESPONDING" -ForegroundColor Red
    Write-Host "   Error: $($_.Exception.Message)" -ForegroundColor Red
}

# Check processes
Write-Host "`n🔍 Checking Node.js Processes..." -ForegroundColor Yellow
$nodeProcesses = Get-Process | Where-Object {$_.ProcessName -eq "node"}
if ($nodeProcesses) {
    Write-Host "✅ Found $($nodeProcesses.Count) Node.js process(es) running" -ForegroundColor Green
    $nodeProcesses | ForEach-Object {
        Write-Host "   PID: $($_.Id) | Memory: $([math]::Round($_.WorkingSet64/1MB, 2)) MB" -ForegroundColor Cyan
    }
} else {
    Write-Host "❌ No Node.js processes found" -ForegroundColor Red
}

# Check ports
Write-Host "`n🌐 Checking Port Usage..." -ForegroundColor Yellow
$ports = @(3000, 5000)
foreach ($port in $ports) {
    $portCheck = netstat -ano | Select-String ":$port"
    if ($portCheck) {
        Write-Host "✅ Port $port is in use" -ForegroundColor Green
    } else {
        Write-Host "❌ Port $port is not in use" -ForegroundColor Red
    }
}

Write-Host "`n🌟 Access URLs:" -ForegroundColor Magenta
Write-Host "   Frontend: http://localhost:3000/" -ForegroundColor Cyan
Write-Host "   Simple Test: http://localhost:3000/simple-test" -ForegroundColor Cyan
Write-Host "   Login: http://localhost:3000/login" -ForegroundColor Cyan
Write-Host "   Backend API: http://localhost:5000/api/" -ForegroundColor Cyan

Write-Host "`n✨ If all checks pass, your SkillHire app should be working!" -ForegroundColor Green