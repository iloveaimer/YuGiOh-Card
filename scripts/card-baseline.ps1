# 卡片渲染基线采样：用 Chrome 打开指定构建产物，逐个切换卡型取 canvas 像素哈希。
# 用法（PowerShell）：
#   $env:AGENT_BROWSER_EXECUTABLE_PATH = "C:\Program Files\Google\Chrome\Application\chrome.exe"
#   .\scripts\card-baseline.ps1 -Url "file:///C:/path/to/dist/index.html?baseline=1"

param(
  [Parameter(Mandatory = $true)][string]$Url,
  [int]$WaitSeconds = 4
)

$cards = @('yugioh', 'rush-duel', 'yugioh-back', 'field-center', 'yugioh-series-2')
$expr = '(()=>{const c=document.querySelector("canvas");const ctx=c.getContext("2d");const d=ctx.getImageData(0,0,c.width,c.height).data;let h=2166136261,n=0;for(let i=0;i<d.length;i+=64){h=Math.imul(h^d[i],16777619);n++}return JSON.stringify({w:c.width,h:c.height,hash:(h>>>0).toString(16),samples:n})})()'

agent-browser --allow-file-access open $Url | Out-Null
agent-browser wait 2500 | Out-Null

$result = @{}
for ($i = 1; $i -le $cards.Count; $i++) {
  agent-browser click ".card-type-item:nth-child($i)" | Out-Null
  Start-Sleep -Seconds $WaitSeconds
  $raw = agent-browser eval $expr 2>$null
  $result[$cards[$i - 1]] = $raw
}

$result.GetEnumerator() | Sort-Object Name | ForEach-Object {
  Write-Output ("{0}: {1}" -f $_.Key, $_.Value)
}
