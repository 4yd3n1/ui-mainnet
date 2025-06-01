# Force English culture for this PowerShell session
[System.Threading.Thread]::CurrentThread.CurrentUICulture = 'en-US'
[System.Threading.Thread]::CurrentThread.CurrentCulture = 'en-US'

# Set environment variables for English
$env:LANG = 'en_US.UTF-8'
$env:LC_ALL = 'en_US.UTF-8'

# Change to project directory
Set-Location "C:\Users\Ayden\mega-ui"

# Start the dev server
npm run dev 