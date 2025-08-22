using System;
using System.IO;
using System.Reflection;
using Microsoft.Win32;

class Program
{
    static int Main(string[] args)
    {
        try
        {
            bool uninstall = args.Length > 0 && args[0].Equals("--uninstall", StringComparison.OrdinalIgnoreCase);

            string baseDir = Path.Combine(
                Environment.GetFolderPath(Environment.SpecialFolder.LocalApplicationData),
                "MyCompany", "MyWordAddin");
            Directory.CreateDirectory(baseDir);
            string manifestPath = Path.Combine(baseDir, "manifest.xml");

            if (uninstall)
            {
                RemoveRegistry(manifestPath);
                TryDelete(manifestPath);
                Console.WriteLine("Uninstalled.");
                return 0;
            }

            // EXEに埋め込んだmanifest.xmlを書き出し
            using var stream = Assembly.GetExecutingAssembly()
                .GetManifestResourceStream("MyWordAddinInstaller.manifest.xml");
            if (stream == null) throw new Exception("Embedded manifest not found.");
            using var fs = File.Create(manifestPath);
            stream.CopyTo(fs);

            // Developerレジストリに登録（ユーザー単位）
            using var key = Registry.CurrentUser.CreateSubKey(
                @"Software\Microsoft\Office\16.0\WEF\Developer");
            key!.SetValue(manifestPath, manifestPath, RegistryValueKind.String);

            Console.WriteLine("Installed:");
            Console.WriteLine(manifestPath);
            Console.WriteLine("Restart Word. Then Insert > My Add-ins > Developer から利用できます。");
            return 0;
        }
        catch (Exception ex)
        {
            Console.Error.WriteLine(ex);
            return 1;
        }
    }

    static void RemoveRegistry(string manifestPath)
    {
        using var key = Registry.CurrentUser.CreateSubKey(
            @"Software\Microsoft\Office\16.0\WEF\Developer");
        if (key?.GetValue(manifestPath) != null)
            key.DeleteValue(manifestPath, throwOnMissingValue: false);
    }

    static void TryDelete(string path)
    {
        try { if (File.Exists(path)) File.Delete(path); } catch { /* ignore */ }
    }
}
