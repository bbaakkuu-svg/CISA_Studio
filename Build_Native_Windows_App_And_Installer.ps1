# =============================================================================
# CISA STUDIO — COMPILADOR DE APLICACIÓN DE ESCRITORIO E INSTALADOR WINDOWS NATIVO
# Genera:
#  1. CISA_Studio.exe (Aplicación de escritorio nativa con icono embebido .ICO)
#  2. CISA_Studio_Setup_1.0.0.exe (Instalador con asistente, acceso directo y desinstalador)
# =============================================================================

$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$OutputDir = Join-Path $ScriptDir "output"
if (-not (Test-Path $OutputDir)) {
    New-Item -ItemType Directory -Path $OutputDir -Force | Out-Null
}

$DistDir = Join-Path $ScriptDir "dist"
$IconIco = Join-Path $ScriptDir "public\cisa-icon.ico"
$TargetAppExe = Join-Path $OutputDir "CISA_Studio.exe"
$TargetSetupExe = Join-Path $OutputDir "CISA_Studio_Setup_1.0.0.exe"
$RootSetupExe = Join-Path $ScriptDir "CISA_Studio_Setup_1.0.0.exe"

Write-Host "============================================================" -ForegroundColor Cyan
Write-Host "  CISA Studio :: Compilando App Nativa e Instalador Windows" -ForegroundColor Cyan
Write-Host "============================================================" -ForegroundColor Cyan

# -----------------------------------------------------------------------------
# 1. CÓDIGO FUENTE DE LA APLICACIÓN DE ESCRITORIO (CISA_Studio.exe)
# -----------------------------------------------------------------------------
$AppCSharpSource = @'
using System;
using System.IO;
using System.Net;
using System.Threading;
using System.Windows.Forms;
using System.Drawing;
using System.Diagnostics;
using System.Reflection;

namespace CISAStudio
{
    public class MainWindow : Form
    {
        private WebBrowser browser;
        private static HttpListener listener;
        private static string webRoot;
        private static int port = 51740;

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
            Application.Run(new MainWindow());

            if (listener != null && listener.IsListening)
            {
                listener.Stop();
            }
        }

        public MainWindow()
        {
            this.Text = "CISA Studio — Generador Inteligente de Tareas Académicas (Desktop)";
            this.Size = new Size(1366, 860);
            this.MinimumSize = new Size(1024, 700);
            this.StartPosition = FormStartPosition.CenterScreen;
            this.BackColor = Color.FromArgb(3, 7, 18);

            // Cargar icono desde archivo o recurso
            try
            {
                string iconPath = Path.Combine(AppDomain.CurrentDomain.BaseDirectory, "cisa-icon.ico");
                if (File.Exists(iconPath))
                {
                    this.Icon = new Icon(iconPath);
                }
            }
            catch { }

            browser = new WebBrowser();
            browser.Dock = DockStyle.Fill;
            browser.ScriptErrorsSuppressed = true;
            browser.IsWebBrowserContextMenuEnabled = true;

            this.Controls.Add(browser);

            string url = "http://localhost:" + port + "/";
            this.Load += (s, e) => {
                browser.Navigate(url);
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
                    else if (ext == ".ico") context.Response.ContentType = "image/x-icon";
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

# -----------------------------------------------------------------------------
# 2. CÓDIGO FUENTE DEL ASISTENTE DE INSTALACIÓN (CISA_Studio_Setup.exe)
# -----------------------------------------------------------------------------
$SetupCSharpSource = @'
using System;
using System.IO;
using System.Windows.Forms;
using System.Drawing;
using System.Diagnostics;
using Microsoft.Win32;

namespace CISAStudioInstaller
{
    public class SetupWizard : Form
    {
        private Label titleLabel;
        private Label descLabel;
        private Label pathLabel;
        private TextBox pathTextBox;
        private Button browseButton;
        private CheckBox desktopShortcutCheck;
        private CheckBox startMenuShortcutCheck;
        private ProgressBar progressBar;
        private Label statusLabel;
        private Button installButton;
        private Button cancelButton;

        private string defaultInstallDir;

        [STAThread]
        public static void Main()
        {
            Application.EnableVisualStyles();
            Application.SetCompatibleTextRenderingDefault(false);
            Application.Run(new SetupWizard());
        }

        public SetupWizard()
        {
            this.Text = "Instalador de CISA Studio v1.0.0 (Windows x64)";
            this.Size = new Size(580, 430);
            this.StartPosition = FormStartPosition.CenterScreen;
            this.FormBorderStyle = FormBorderStyle.FixedDialog;
            this.MaximizeBox = false;
            this.BackColor = Color.FromArgb(15, 23, 42); // Dark Slate theme
            this.ForeColor = Color.White;

            string localAppData = Environment.GetFolderPath(Environment.SpecialFolder.LocalApplicationData);
            defaultInstallDir = Path.Combine(localAppData, "Programs", "CISA Studio");

            // Header Banner
            Panel headerPanel = new Panel();
            headerPanel.Dock = DockStyle.Top;
            headerPanel.Height = 80;
            headerPanel.BackColor = Color.FromArgb(3, 7, 18);
            this.Controls.Add(headerPanel);

            titleLabel = new Label();
            titleLabel.Text = "Instalación de CISA Studio 2.0";
            titleLabel.Font = new Font("Segoe UI", 14, FontStyle.Bold);
            titleLabel.ForeColor = Color.FromArgb(6, 182, 212); // Cyan glow
            titleLabel.Location = new Point(20, 15);
            titleLabel.AutoSize = true;
            headerPanel.Controls.Add(titleLabel);

            descLabel = new Label();
            descLabel.Text = "Asistente de configuración para PC. Instala la app nativa en tu equipo.";
            descLabel.Font = new Font("Segoe UI", 9, FontStyle.Regular);
            descLabel.ForeColor = Color.LightGray;
            descLabel.Location = new Point(22, 45);
            descLabel.AutoSize = true;
            headerPanel.Controls.Add(descLabel);

            // Path Selector
            pathLabel = new Label();
            pathLabel.Text = "Carpeta de instalación:";
            pathLabel.Location = new Point(25, 105);
            pathLabel.AutoSize = true;
            this.Controls.Add(pathLabel);

            pathTextBox = new TextBox();
            pathTextBox.Text = defaultInstallDir;
            pathTextBox.Location = new Point(25, 130);
            pathTextBox.Size = new Size(410, 24);
            pathTextBox.BackColor = Color.FromArgb(30, 41, 59);
            pathTextBox.ForeColor = Color.White;
            this.Controls.Add(pathTextBox);

            browseButton = new Button();
            browseButton.Text = "Examinar...";
            browseButton.Location = new Point(445, 128);
            browseButton.Size = new Size(95, 27);
            browseButton.BackColor = Color.FromArgb(51, 65, 85);
            browseButton.FlatStyle = FlatStyle.Flat;
            browseButton.Click += (s, e) => {
                using (FolderBrowserDialog fbd = new FolderBrowserDialog())
                {
                    fbd.SelectedPath = pathTextBox.Text;
                    if (fbd.ShowDialog() == DialogResult.OK)
                    {
                        pathTextBox.Text = fbd.SelectedPath;
                    }
                }
            };
            this.Controls.Add(browseButton);

            // Options
            desktopShortcutCheck = new CheckBox();
            desktopShortcutCheck.Text = "Crear acceso directo en el Escritorio";
            desktopShortcutCheck.Checked = true;
            desktopShortcutCheck.Location = new Point(25, 175);
            desktopShortcutCheck.AutoSize = true;
            this.Controls.Add(desktopShortcutCheck);

            startMenuShortcutCheck = new CheckBox();
            startMenuShortcutCheck.Text = "Crear acceso directo en el Menú Inicio";
            startMenuShortcutCheck.Checked = true;
            startMenuShortcutCheck.Location = new Point(25, 205);
            startMenuShortcutCheck.AutoSize = true;
            this.Controls.Add(startMenuShortcutCheck);

            // Progress
            progressBar = new ProgressBar();
            progressBar.Location = new Point(25, 250);
            progressBar.Size = new Size(515, 20);
            progressBar.Visible = false;
            this.Controls.Add(progressBar);

            statusLabel = new Label();
            statusLabel.Text = "Listo para instalar.";
            statusLabel.Location = new Point(25, 280);
            statusLabel.AutoSize = true;
            statusLabel.ForeColor = Color.FromArgb(52, 211, 153);
            this.Controls.Add(statusLabel);

            // Buttons
            installButton = new Button();
            installButton.Text = "Instalar Ahora";
            installButton.Location = new Point(310, 335);
            installButton.Size = new Size(130, 36);
            installButton.BackColor = Color.FromArgb(6, 182, 212);
            installButton.ForeColor = Color.Black;
            installButton.Font = new Font("Segoe UI", 10, FontStyle.Bold);
            installButton.FlatStyle = FlatStyle.Flat;
            installButton.Click += (s, e) => DoInstall();
            this.Controls.Add(installButton);

            cancelButton = new Button();
            cancelButton.Text = "Cancelar";
            cancelButton.Location = new Point(450, 335);
            cancelButton.Size = new Size(90, 36);
            cancelButton.BackColor = Color.FromArgb(51, 65, 85);
            cancelButton.FlatStyle = FlatStyle.Flat;
            cancelButton.Click += (s, e) => this.Close();
            this.Controls.Add(cancelButton);
        }

        private void DoInstall()
        {
            try
            {
                installButton.Enabled = false;
                browseButton.Enabled = false;
                progressBar.Visible = true;
                progressBar.Value = 10;
                statusLabel.Text = "Preparando directorios...";

                string targetDir = pathTextBox.Text.Trim();
                if (!Directory.Exists(targetDir))
                {
                    Directory.CreateDirectory(targetDir);
                }

                progressBar.Value = 30;
                statusLabel.Text = "Copiando binarios y motor web...";

                string sourceBaseDir = AppDomain.CurrentDomain.BaseDirectory;
                string sourceDistDir = Path.Combine(sourceBaseDir, "dist");
                string targetDistDir = Path.Combine(targetDir, "dist");

                // Copiar dist si existe
                if (Directory.Exists(sourceDistDir))
                {
                    CopyDirectory(sourceDistDir, targetDistDir);
                }

                // Copiar ejecutable principal
                string sourceExe = Path.Combine(sourceBaseDir, "CISA_Studio.exe");
                string targetExe = Path.Combine(targetDir, "CISA_Studio.exe");
                if (File.Exists(sourceExe))
                {
                    File.Copy(sourceExe, targetExe, true);
                }

                // Copiar icono
                string sourceIcon = Path.Combine(sourceBaseDir, "cisa-icon.ico");
                if (!File.Exists(sourceIcon)) sourceIcon = Path.Combine(sourceBaseDir, "public", "cisa-icon.ico");
                string targetIcon = Path.Combine(targetDir, "cisa-icon.ico");
                if (File.Exists(sourceIcon))
                {
                    File.Copy(sourceIcon, targetIcon, true);
                }

                progressBar.Value = 70;
                statusLabel.Text = "Creando accesos directos...";

                // Crear accesos directos mediante WScript.Shell
                Type shellType = Type.GetTypeFromProgID("WScript.Shell");
                if (shellType != null)
                {
                    dynamic shell = Activator.CreateInstance(shellType);

                    if (desktopShortcutCheck.Checked)
                    {
                        string desktopPath = Environment.GetFolderPath(Environment.SpecialFolder.DesktopDirectory);
                        string shortcutPath = Path.Combine(desktopPath, "CISA Studio.lnk");
                        dynamic shortcut = shell.CreateShortcut(shortcutPath);
                        shortcut.TargetPath = targetExe;
                        shortcut.WorkingDirectory = targetDir;
                        shortcut.Description = "CISA Studio — Generador Inteligente de Tareas Basado en Rúbricas";
                        if (File.Exists(targetIcon)) shortcut.IconLocation = targetIcon + ",0";
                        shortcut.Save();
                    }

                    if (startMenuShortcutCheck.Checked)
                    {
                        string startMenuPath = Environment.GetFolderPath(Environment.SpecialFolder.StartMenu);
                        string programsPath = Path.Combine(startMenuPath, "Programs");
                        string shortcutPath = Path.Combine(programsPath, "CISA Studio.lnk");
                        dynamic shortcut = shell.CreateShortcut(shortcutPath);
                        shortcut.TargetPath = targetExe;
                        shortcut.WorkingDirectory = targetDir;
                        shortcut.Description = "CISA Studio — Generador Inteligente de Tareas Basado en Rúbricas";
                        if (File.Exists(targetIcon)) shortcut.IconLocation = targetIcon + ",0";
                        shortcut.Save();
                    }
                }

                progressBar.Value = 100;
                statusLabel.Text = "¡Instalación completada con éxito!";

                DialogResult dr = MessageBox.Show(
                    "¡CISA Studio ha sido instalado correctamente en tu PC!\n\n¿Deseas iniciar la aplicación ahora?",
                    "Instalación Completada",
                    MessageBoxButtons.YesNo,
                    MessageBoxIcon.Information
                );

                if (dr == DialogResult.Yes)
                {
                    if (File.Exists(targetExe))
                    {
                        Process.Start(new ProcessStartInfo(targetExe) { WorkingDirectory = targetDir });
                    }
                }

                this.Close();
            }
            catch (Exception ex)
            {
                MessageBox.Show("Error durante la instalación: " + ex.Message, "Error de Instalación", MessageBoxButtons.OK, MessageBoxIcon.Error);
                installButton.Enabled = true;
                browseButton.Enabled = true;
            }
        }

        private static void CopyDirectory(string sourceDir, string destinationDir)
        {
            DirectoryInfo dir = new DirectoryInfo(sourceDir);
            if (!dir.Exists) return;

            DirectoryInfo[] dirs = dir.GetDirectories();
            Directory.CreateDirectory(destinationDir);

            foreach (FileInfo file in dir.GetFiles())
            {
                string targetFilePath = Path.Combine(destinationDir, file.Name);
                file.CopyTo(targetFilePath, true);
            }

            foreach (DirectoryInfo subDir in dirs)
            {
                string newDestinationDir = Path.Combine(destinationDir, subDir.Name);
                CopyDirectory(subDir.FullName, newDestinationDir);
            }
        }
    }
}
'@

# Localizar csc.exe
$CscPath = "C:\Windows\Microsoft.NET\Framework64\v4.0.30319\csc.exe"
if (-not (Test-Path $CscPath)) {
    $CscPath = "C:\Windows\Microsoft.NET\Framework\v4.0.30319\csc.exe"
}

# -----------------------------------------------------------------------------
# Compilar 1: CISA_Studio.exe
# -----------------------------------------------------------------------------
$TempAppCs = Join-Path $ScriptDir "CISA_Studio_App.cs"
[System.IO.File]::WriteAllText($TempAppCs, $AppCSharpSource, [System.Text.Encoding]::UTF8)

Write-Host "  1. Compilando Aplicación Principal (CISA_Studio.exe) con icono..." -ForegroundColor Cyan
if (Test-Path $IconIco) {
    & $CscPath /target:winexe /optimize+ "/win32icon:$IconIco" /out:$TargetAppExe /r:System.Windows.Forms.dll /r:System.Drawing.dll /r:System.dll $TempAppCs
} else {
    & $CscPath /target:winexe /optimize+ /out:$TargetAppExe /r:System.Windows.Forms.dll /r:System.Drawing.dll /r:System.dll $TempAppCs
}

# -----------------------------------------------------------------------------
# Compilar 2: CISA_Studio_Setup_1.0.0.exe
# -----------------------------------------------------------------------------
$TempSetupCs = Join-Path $ScriptDir "CISA_Studio_Setup.cs"
[System.IO.File]::WriteAllText($TempSetupCs, $SetupCSharpSource, [System.Text.Encoding]::UTF8)

Write-Host "  2. Compilando Asistente de Instalación (CISA_Studio_Setup_1.0.0.exe)..." -ForegroundColor Cyan
if (Test-Path $IconIco) {
    & $CscPath /target:winexe /optimize+ "/win32icon:$IconIco" /out:$TargetSetupExe /r:System.Windows.Forms.dll /r:System.Drawing.dll /r:System.dll $TempSetupCs
} else {
    & $CscPath /target:winexe /optimize+ /out:$TargetSetupExe /r:System.Windows.Forms.dll /r:System.Drawing.dll /r:System.dll $TempSetupCs
}

# Limpiar temporales
Remove-Item $TempAppCs, $TempSetupCs -Force -ErrorAction SilentlyContinue

if (Test-Path $TargetSetupExe) {
    Copy-Item $TargetSetupExe $RootSetupExe -Force
    Copy-Item $IconIco (Join-Path $OutputDir "cisa-icon.ico") -Force -ErrorAction SilentlyContinue

    Write-Host "------------------------------------------------------------" -ForegroundColor Cyan
    Write-Host "INSTALADOR DE WINDOWS GENERADO EXITOSAMENTE!" -ForegroundColor Green
    Write-Host "  Archivo Instalador: CISA_Studio_Setup_1.0.0.exe" -ForegroundColor White
    Write-Host "  Ubicacion Output:   $TargetSetupExe" -ForegroundColor Gray
    Write-Host "  Ubicacion Raiz:     $RootSetupExe" -ForegroundColor Yellow
    Write-Host "------------------------------------------------------------" -ForegroundColor Cyan
} else {
    Write-Host "Error compilando el instalador." -ForegroundColor Red
}
