; Compile with an isolated app payload and /DPayloadDir, /DReleaseDir, /DReleaseFileName.
#define BootstrapArgs "-E -s -B -X utf8"
#ifndef ReleaseVersion
  #define ReleaseVersion "0.1.1"
#endif
#ifdef OfflineBuild
  #define SetupMode "Offline"
  #define ComponentArgs " --offline-setup"
#else
  #define SetupMode "Online"
  #define ComponentArgs ""
#endif

[Setup]
AppId=ShotDecode.VideoBreakdownWorkbench
AppName=ShotDecode
AppVersion={#ReleaseVersion}
AppPublisher=ShotDecode contributors
DefaultDirName={localappdata}\VideoBreakdownWorkbench
DefaultGroupName=ShotDecode
DisableProgramGroupPage=yes
PrivilegesRequired=lowest
ArchitecturesAllowed=x64os
ArchitecturesInstallIn64BitMode=x64os
SetupArchitecture=x64
MinVersion=10.0
SetupIconFile={#PayloadDir}\app\workbench.ico
UninstallDisplayIcon={app}\ShotDecode.exe
Uninstallable=not PortableMode
CreateUninstallRegKey=not PortableMode
UsePreviousAppDir=not PortableMode
OutputDir={#ReleaseDir}
OutputBaseFilename={#ReleaseFileName}
VersionInfoVersion={#ReleaseVersion}.0
VersionInfoProductName=ShotDecode
VersionInfoDescription=ShotDecode {#SetupMode} Setup
WizardStyle=modern
Compression=lzma2/fast
SolidCompression=yes
LZMANumBlockThreads=4
#ifdef OfflineBuild
DiskSpanning=yes
DiskSliceSize=1342177280
SlicesPerDisk=1
#endif

[Languages]
Name: "english"; MessagesFile: "compiler:Default.isl"
Name: "chinesesimplified"; MessagesFile: "compiler:Languages\ChineseSimplified.isl"

[CustomMessages]
english.ComponentShortcut=ShotDecode Component Setup
english.PrepareComponents=Checking video tools and Windows runtimes…
english.ComponentsPending=ShotDecode has been installed. Open ShotDecode or choose ShotDecode Component Setup from the Start menu to finish installing the required components.
chinesesimplified.ComponentShortcut=ShotDecode 组件安装
chinesesimplified.PrepareComponents=正在检查视频工具和 Windows 运行组件…
chinesesimplified.ComponentsPending=ShotDecode 已安装。启动 ShotDecode，或从开始菜单打开「ShotDecode 组件安装」，继续准备所需组件。

[Tasks]
Name: "desktopicon"; Description: "{cm:CreateDesktopIcon}"; Check: not PortableMode

[Files]
#ifdef OfflineBuild
Source: "{#PayloadDir}\*"; DestDir: "{app}"; Flags: ignoreversion recursesubdirs createallsubdirs
#else
Source: "{#PayloadDir}\*"; DestDir: "{app}"; Excludes: "\ffmpeg\*,\prerequisites\*,\licenses\ffmpeg\*,\app\prerequisite-checksums.json,\asr-model\model.int8.onnx,\asr-model-ja\model.int8.onnx,\models\UVR-MDX-NET-Inst_HQ_3.onnx,\translation\Hy-MT2-1.8B-Q4_K_M.gguf"; Flags: ignoreversion recursesubdirs createallsubdirs
#endif

[Icons]
Name: "{autoprograms}\ShotDecode"; Filename: "{app}\ShotDecode.exe"; WorkingDir: "{app}"; AppUserModelID: "VideoBreakdown.Workbench"; Check: not PortableMode
Name: "{autoprograms}\{cm:ComponentShortcut}"; Filename: "{app}\runtime\pythonw.exe"; Parameters: "{#BootstrapArgs} ""{app}\app\portable_start.py"" --components-only{#ComponentArgs}"; WorkingDir: "{app}"; IconFilename: "{app}\ShotDecode.exe"; Check: not PortableMode
Name: "{autodesktop}\ShotDecode"; Filename: "{app}\ShotDecode.exe"; WorkingDir: "{app}"; AppUserModelID: "VideoBreakdown.Workbench"; Tasks: desktopicon

[Run]
Filename: "{app}\ShotDecode.exe"; Description: "{cm:LaunchProgram,ShotDecode}"; Flags: nowait postinstall skipifsilent; Check: ComponentsReady

[Code]
var
  ReadyToLaunch: Boolean;

function PortableMode: Boolean;
begin
  Result := ExpandConstant('{param:PORTABLE|0}') = '1';
end;

function ComponentsReady: Boolean;
begin
  Result := ReadyToLaunch;
end;

procedure CurStepChanged(CurStep: TSetupStep);
var
  ExitCode: Integer;
  Exe, Params: String;
begin
  if (CurStep <> ssPostInstall) or WizardSilent then
    Exit;
  WizardForm.StatusLabel.Caption := ExpandConstant('{cm:PrepareComponents}');
  Exe := ExpandConstant('{app}\runtime\pythonw.exe');
  Params := '{#BootstrapArgs} ' + AddQuotes(ExpandConstant('{app}\app\portable_start.py')) + ' --prepare-only{#ComponentArgs}';
  if Exec(Exe, Params, ExpandConstant('{app}'), SW_HIDE, ewWaitUntilTerminated, ExitCode) then
  begin
    ReadyToLaunch := ExitCode = 0;
    Log('ShotDecode component setup exit code: ' + IntToStr(ExitCode));
  end
  else
    Log('Could not start ShotDecode component setup: ' + SysErrorMessage(ExitCode));
end;

procedure CurPageChanged(CurPageID: Integer);
begin
  if (CurPageID = wpFinished) and not ComponentsReady then
    WizardForm.FinishedLabel.Caption := ExpandConstant('{cm:ComponentsPending}');
end;
