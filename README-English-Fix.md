# Fix for French Error Messages in PowerShell

## The Problem
Windows PowerShell is showing error messages in French instead of English.

## Quick Solution
Always use this command to start your dev server:

```powershell
[System.Threading.Thread]::CurrentThread.CurrentUICulture = 'en-US'; [System.Threading.Thread]::CurrentThread.CurrentCulture = 'en-US'; npm run dev
```

## Alternative Solutions

### Option 1: Use the provided scripts
- Run `.\start-dev-english.bat` (from Command Prompt)
- Or run `.\start-dev-english.ps1` (from PowerShell)

### Option 2: Always use npx instead of npm run
```powershell
npx next dev
```

### Option 3: Permanent PowerShell Profile Fix
1. Open PowerShell as Administrator
2. Run: `New-Item -Path $PROFILE -Type File -Force`
3. Run: `notepad $PROFILE`
4. Add these lines:
```powershell
[System.Threading.Thread]::CurrentThread.CurrentUICulture = 'en-US'
[System.Threading.Thread]::CurrentThread.CurrentCulture = 'en-US'
```
5. Save and restart PowerShell

## Why This Happens
Your Windows system locale is set to French, which affects PowerShell error messages. This is a Windows system setting, not a project issue.

## Working Commands
- ✅ `npm run dev` (works, but sometimes shows French errors)
- ✅ `npx next dev` (works consistently)
- ✅ Using the provided English scripts
- ✅ Setting culture first, then running commands 