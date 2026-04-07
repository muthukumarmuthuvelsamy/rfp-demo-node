$body = Get-Content test-mcp.json -Raw
$headers = @{
    'Content-Type' = 'application/json'
    'Authorization' = 'Bearer lala123'
}

try {
    $response = Invoke-WebRequest -Uri 'http://localhost:3000/mcp' -Method POST -Headers $headers -Body $body
    Write-Host "Status: $($response.StatusCode)"
    Write-Host "Content:"
    Write-Host $response.Content
} catch {
    Write-Host "Error: $($_.Exception.Message)"
    if ($_.Exception.Response) {
        $reader = New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream())
        $responseBody = $reader.ReadToEnd()
        Write-Host "Response Body:"
        Write-Host $responseBody
    }
}

# Made with Bob
