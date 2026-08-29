# =============================================================================
# CISA STUDIO - COMPILADOR NATIVO DE EJECUTABLE WINDOWS (.EXE)
# =============================================================================

$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$OutputDir = Join-Path $ScriptDir "output"
if (-not (Test-Path $OutputDir)) {
    New-Item -ItemType Directory -Path $OutputDir -Force | Out-Null
}

$DistDir = Join-Path $ScriptDir "dist"
$TargetExe = Join-Path $OutputDir "CISA_Studio_Windows.exe"
$RootExe = Join-Path $ScriptDir "CISA_Studio_Windows.exe"

Write-Host "============================================================" -ForegroundColor Cyan
Write-Host "  CISA Studio :: Compilando Ejecutable Nativo de Windows (.EXE)" -ForegroundColor Cyan
Write-Host "============================================================" -ForegroundColor Cyan

$CSharpSource = @'
using System;
using System.IO;
using System.Net;
using System.Threading;
using System.Windows.Forms;
using System.Drawing;
using System.Diagnostics;

namespace CISAStudio
{
    public class Program : Form
    {
        private WebBrowser browser;
        private static HttpListener listener;
        private static string webRoot;
        private static int port = 51739;

        [STAThread]
        public static void Main()
        {
            Application.EnableVisualStyles();
            Application.SetCompatibleTextRenderingDefault(false);

            string baseDir = AppDomain.CurrentDomain.BaseDirectory;
            webRoot = Path.Combine(baseDir, "dist");
            if (!Directory.Exists(webRoot))
            {
                webRoot = Path.Combine(baseDir, "..", "dist");
            }
            if (!Directory.Exists(webRoot))
            {
                webRoot = baseDir;
            }

            StartLocalServer();
            Application.Run(new Program());

            if (listener != null && listener.IsListening)
            {
                listener.Stop();
            }
        }

        public Program()
        {
            this.Text = "CISA Studio - Generador Inteligente de Tareas Basado en Rubricas (Desktop Pro)";
            this.Size = new Size(1280, 850);
            this.StartPosition = FormStartPosition.CenterScreen;
            this.BackColor = Color.FromArgb(3, 7, 18);

            browser = new WebBrowser();
            browser.Dock = DockStyle.Fill;
            browser.ScriptErrorsSuppressed = true;
            browser.IsWebBrowserContextMenuEnabled = true;

            this.Controls.Add(browser);

            string url = "http://localhost:" + port + "/";
            this.Load += (s, e) => {
                try {
                    Process.Start(new ProcessStartInfo(url) { UseShellExecute = true });
                    browser.Navigate(url);
                } catch {
                    browser.Navigate(url);
                }
            };
        }

        private static void StartLocalServer()
        {
            new Thread(() =>
            {
                try
                {
                    listener = new HttpListener();
                    listener.Prefixes.Add("http://localhost:" + port + "/");
                    listener.Start();

                    while (listener.IsListening)
                    {
                        var context = listener.GetContext();
                        ThreadPool.QueueUserWorkItem((c) => ProcessRequest((HttpListenerContext)c), context);
                    }
                }
                catch (Exception) { }
            })
            { IsBackground = true }.Start();
        }

        private static void ProcessRequest(HttpListenerContext context)
        {
            try
            {
                string rawUrl = context.Request.Url.AbsolutePath.TrimStart('/');
                if (string.IsNullOrEmpty(rawUrl)) rawUrl = "index.html";

                string filePath = Path.Combine(webRoot, rawUrl.Replace('/', Path.DirectorySeparatorChar));

                if (!File.Exists(filePath))
                {
                    filePath = Path.Combine(webRoot, "index.html");
                }

                if (File.Exists(filePath))
                {
                    byte[] bytes = File.ReadAllBytes(filePath);
                    string ext = Path.GetExtension(filePath).ToLower();

                    if (ext == ".html") context.Response.ContentType = "text/html; charset=utf-8";
                    else if (ext == ".js") context.Response.ContentType = "application/javascript";
                    else if (ext == ".css") context.Response.ContentType = "text/css";
                    else if (ext == ".png") context.Response.ContentType = "image/png";
                    else if (ext == ".svg") context.Response.ContentType = "image/svg+xml";
                    else if (ext == ".json") context.Response.ContentType = "application/json";

                    context.Response.ContentLength64 = bytes.Length;
                    context.Response.OutputStream.Write(bytes, 0, bytes.Length);
                }
                else
                {
                    context.Response.StatusCode = 404;
                }
            }
            catch (Exception)
            {
                context.Response.StatusCode = 500;
            }
            finally
            {
                try { context.Response.OutputStream.Close(); } catch { }
            }
        }
    }
}
'@

# Localizar el compilador C# nativo de Windows (csc.exe)
$CscPath = "C:\Windows\Microsoft.NET\Framework64\v4.0.30319\csc.exe"
if (-not (Test-Path $CscPath)) {
    $CscPath = "C:\Windows\Microsoft.NET\Framework\v4.0.30319\csc.exe"
}

$TempCsFile = Join-Path $ScriptDir "CISA_Studio_Desktop.cs"
[System.IO.File]::WriteAllText($TempCsFile, $CSharpSource, [System.Text.Encoding]::UTF8)

Write-Host "  Compilando binario con .NET Compiler..." -ForegroundColor Cyan
& $CscPath /target:winexe /optimize+ /out:$TargetExe /r:System.Windows.Forms.dll /r:System.Drawing.dll /r:System.dll $TempCsFile

if (Test-Path $TargetExe) {
    Copy-Item -Path $TargetExe -Destination $RootExe -Force
    Remove-Item -Path $TempCsFile -Force -ErrorAction SilentlyContinue

    Write-Host "------------------------------------------------------------" -ForegroundColor Cyan
    Write-Host "Ejecutable nativo de Windows generado correctamente!" -ForegroundColor Green
    Write-Host "  Archivo: CISA_Studio_Windows.exe" -ForegroundColor White
    Write-Host "  Ubicacion Output: $TargetExe" -ForegroundColor Gray
    Write-Host "  Ubicacion Raiz:   $RootExe" -ForegroundColor Gray
    Write-Host "------------------------------------------------------------" -ForegroundColor Cyan
} else {
    Write-Host "Error: No se pudo compilar el ejecutable de Windows." -ForegroundColor Red
}
