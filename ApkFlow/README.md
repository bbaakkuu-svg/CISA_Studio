# 📱 ApkFlow — Motor de Automatización Web a APK Android Firmado

> **Suite Integral de Empaquetado Híbrido:** Transforma cualquier aplicación web estática o SPA (HTML5, CSS3, JavaScript) en un binario nativo Android (`.apk`) optimizado, acelerado por hardware y firmado criptográficamente (esquema v1 y v2), listo para su distribución, descarga e instalación directa.

---

## 📑 Tabla de Contenidos
1. [Visión General & Arquitectura](#-visión-general--arquitectura)
2. [Estructura del Subsistema `ApkFlow`](#-estructura-del-subsistema-apkflow)
3. [Requisitos Previos del Sistema](#-requisitos-previos-del-sistema)
4. [Configuración Centralizada (`config.json`)](#-configuración-centralizada-configjson)
5. [Guía Rápida de Uso (Ejecución en 1 Click)](#-guía-rápida-de-uso-ejecución-en-1-click)
6. [Flujo Modular Paso a Paso](#-flujo-modular-paso-a-paso)
7. [Criptografía, Keystore y Seguridad](#-criptografía-keystore-y-seguridad)
8. [Matriz de Solución de Problemas](#-matriz-de-solución-de-problemas)

---

## 🌟 Visión General & Arquitectura

`ApkFlow` desacopla la complejidad del desarrollo nativo de Android y el CLI de Capacitor mediante un conjunto de scripts orquestados en PowerShell y un manifiesto declarativo en JSON.

```
+-------------------------------------------------------------------------+
|                  CÓDIGO WEB FUENTE (HTML5 / CSS / JS)                   |
|                  vitaltrack-mobile/www/ (SPA / Dashboard)               |
+-------------------------------------------------------------------------+
                                    │
                                    ▼ (03_Sync_Web_Assets.ps1)
+-------------------------------------------------------------------------+
|                    MOTOR HÍBRIDO (CAPACITOR 8)                          |
|  - Configuración automatizada (capacitor.config.json)                    |
|  - Inyección en assets/public/                                          |
|  - Puente JS-to-Native acelerado                                        |
+-------------------------------------------------------------------------+
                                    │
                                    ▼ (02_Setup_Keystore.ps1 & 04_Build)
+-------------------------------------------------------------------------+
|                   PLATAFORMA NATIVA (ANDROID SDK 36)                    |
|  - SDK Platform 36 (Android 16 Ready) / Min SDK 24                      |
|  - AndroidX AppCompat + CoordinatorLayout + Core-SplashScreen           |
|  - Keystore RSA 2048-bit (vitaltrack-release.keystore)                  |
|  - Compilador Gradle Wrapper (assembleRelease)                          |
+-------------------------------------------------------------------------+
                                    │
                                    ▼
+-------------------------------------------------------------------------+
|                     BINARIO FINAL LISTO PARA INSTALAR                   |
|  - ApkFlow/output/VitalTrack-v2.2-signed.apk (~3.24 MB)                  |
|  - dist/VitalTrack-v2.2-signed.apk                                      |
+-------------------------------------------------------------------------+
```

---

## 📂 Estructura del Subsistema `ApkFlow`

```
ApkFlow/
├── config.json                     # Manifiesto central de configuración del proyecto y compilación
├── README.md                       # [ESTE MANUAL] Guía técnica de uso y mantenimiento
├── 00_Check_Environment.ps1        # Validador de herramientas del sistema (Node, JDK, SDK 36, Gradle)
├── 01_Init_Capacitor.ps1           # Inicializador de Capacitor 8 y contenedor nativo android/
├── 02_Setup_Keystore.ps1           # Generador de Keystore criptográfico y configurador de signingConfigs
├── 03_Sync_Web_Assets.ps1          # Sincronizador de assets web (HTML/CSS/JS) en la app nativa
├── 04_Build_Signed_APK.ps1         # Compilador Gradle Wrapper y exportador de binarios versionados
├── 05_Run_Full_Pipeline.ps1        # Orquestador maestro "One-Click" (Ejecuta pasos del 00 al 04)
├── templates/                      # Plantillas base de configuración
│   ├── capacitor.config.template.json
│   ├── build.gradle.template
│   └── variables.gradle.template
└── output/                         # Salida final con los APKs firmados listos para descargar
```

---

## 💻 Requisitos Previos del Sistema

Antes de ejecutar la suite, asegúrese de contar con:
1. **Node.js LTS (v18+ o v20+):** `node -v` y `npm -v`.
2. **Java OpenJDK 17 o 21:** Variable de entorno `JAVA_HOME` configurada.
3. **Android SDK:** Platform 36 y Build-Tools instalados (Android Studio o Command-line tools).
4. **PowerShell 5.1 o PowerShell 7** en Windows / macOS / Linux.

> **Tip:** Ejecute `.\00_Check_Environment.ps1` para verificar automáticamente si su máquina cumple con todos los requisitos.

---

## ⚙️ Configuración Centralizada (`config.json`)

Toda la personalización del empaquetado se gestiona en `ApkFlow/config.json`:

```json
{
  "project": {
    "appName": "VitalTrack",
    "appId": "com.vitaltrack.app",
    "versionName": "2.2.0",
    "versionCode": 220
  },
  "paths": {
    "webSourceDir": "../vitaltrack-mobile/www",
    "mobileProjectDir": "../vitaltrack-mobile",
    "androidDir": "../vitaltrack-mobile/android",
    "outputDir": "./output",
    "distDir": "../dist"
  },
  "android": {
    "minSdkVersion": 24,
    "compileSdkVersion": 36,
    "targetSdkVersion": 36
  },
  "signing": {
    "keystoreFile": "vitaltrack-release.keystore",
    "keyAlias": "vitaltrack",
    "storePassword": "vitaltrack123",
    "keyPassword": "vitaltrack123",
    "validityDays": 10000,
    "keyAlgorithm": "RSA",
    "keySize": 2048,
    "v1SigningEnabled": true,
    "v2SigningEnabled": true
  }
}
```

---

## 🚀 Guía Rápida de Uso (Ejecución en 1 Click)

Abra una terminal de PowerShell en la carpeta `ApkFlow/` y ejecute:

```powershell
cd ApkFlow
.\05_Run_Full_Pipeline.ps1
```

O en modo desatendido (para pipelines de CI/CD):

```powershell
.\05_Run_Full_Pipeline.ps1 -NonInteractive
```

Al finalizar el proceso, encontrará su binario listo para instalar en:
`ApkFlow/output/VitalTrack-v2.2-signed.apk`

---

## 🧩 Flujo Modular Paso a Paso

Si prefiere ejecutar cada fase de manera independiente para depuración o ajustes:

### Paso 0: Diagnóstico del Entorno
```powershell
.\00_Check_Environment.ps1
```
Valida la presencia y versiones de Node.js, npm, Java, Android SDK y Keytool.

### Paso 1: Inicialización de Capacitor
```powershell
.\01_Init_Capacitor.ps1
```
Instala `@capacitor/core`, `@capacitor/android` y `@capacitor/cli`, genera `capacitor.config.json` y añade la plataforma nativa.

### Paso 2: Keystore & Configuración Gradle
```powershell
.\02_Setup_Keystore.ps1
```
Genera el almacén criptográfico `vitaltrack-release.keystore` (si no existe) y parchea `variables.gradle` y `build.gradle` con `signingConfigs.release`.

### Paso 3: Sincronización Web
```powershell
.\03_Sync_Web_Assets.ps1
```
Inyecta los archivos de `vitaltrack-mobile/www/` dentro del directorio de assets compilados de Android.

### Paso 4: Compilación y Firma de APK
```powershell
.\04_Build_Signed_APK.ps1
```
Lanza Gradle Wrapper `assembleRelease`, extrae el binario firmado y lo copia a `output/` y `dist/`.

---

## 🔐 Criptografía, Keystore y Seguridad

- **Esquema de Firma v1 y v2:** El APK generado incluye firmas JAR clásicas (v1) y la firma por bloque de APK (v2 de Android 7.0+), lo que previene manipulaciones y acelera la instalación en el móvil.
- **Seguridad en WebView:** Se fuerza el protocolo seguro `https://` dentro de la aplicación local y se bloquea el tráfico en texto plano (`cleartext: false`).

---

## 🛠️ Matriz de Solución de Problemas

| Síntoma / Error | Causa Raíz | Solución en ApkFlow |
| :--- | :--- | :--- |
| `JAVA_HOME is not set` | Variable de entorno no configurada en el sistema. | Defina `JAVA_HOME` apuntando al directorio raíz del JDK (ej. `C:\Program Files\Java\jdk-21`). |
| `ANDROID_HOME not found` | Android SDK no detectado. | Instale Android Studio o configure `ANDROID_HOME` en `C:\Users\<Usuario>\AppData\Local\Android\Sdk`. |
| `INSTALL_FAILED_UPDATE_INCOMPATIBLE` | Conflicto de firmas con una versión instalada previamente en el móvil. | Desinstale la app antigua de su móvil antes de instalar el nuevo APK de producción. |
| `INSTALL_FAILED_VERSION_DOWNGRADE` | `versionCode` menor o igual al instalado. | Incremente `versionCode` en `ApkFlow/config.json` y vuelva a ejecutar `05_Run_Full_Pipeline.ps1`. |

---
*ApkFlow Framework · VitalTrack Mobile Automation Suite · © 2026*
