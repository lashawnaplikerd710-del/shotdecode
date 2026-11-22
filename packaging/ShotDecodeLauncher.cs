using System;
using System.Diagnostics;
using System.IO;
using System.Reflection;
using System.Windows.Forms;

[assembly: AssemblyTitle("ShotDecode")]
[assembly: AssemblyProduct("ShotDecode")]

internal static class ShotDecodeLauncher
{
    [STAThread]
    private static int Main()
    {
        string root = AppDomain.CurrentDomain.BaseDirectory;
        string python = Path.Combine(root, @"runtime\pythonw.exe");
        string startup = Path.Combine(root, @"app\portable_start.py");
        try
        {
            if (!File.Exists(python) || !File.Exists(startup))
                throw new FileNotFoundException("启动文件不完整，请重新运行 ShotDecode 安装程序。");

            var command = new ProcessStartInfo
            {
                FileName = python,
                Arguments = "-E -s -B -X utf8 \"" + startup + "\"",
                WorkingDirectory = root,
                UseShellExecute = false,
                CreateNoWindow = true
            };
            using (Process process = Process.Start(command))
            {
                if (process == null)
                    throw new InvalidOperationException("无法打开工作台。");
            }
            return 0;
        }
        catch (Exception error)
        {
            MessageBox.Show(error.Message, "ShotDecode", MessageBoxButtons.OK, MessageBoxIcon.Error);
            return 1;
        }
    }
}
