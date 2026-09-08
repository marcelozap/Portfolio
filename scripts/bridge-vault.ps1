# Private JSON pipe for bridge-vault.ts. No interactive credential reader or logger.
Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'
$ProgressPreference = 'SilentlyContinue'
$WarningPreference = 'SilentlyContinue'
$InformationPreference = 'SilentlyContinue'

try {
    if (-not [Console]::IsInputRedirected -or -not [Console]::IsOutputRedirected) { throw 'vault' }
    [Console]::InputEncoding = New-Object Text.UTF8Encoding($false, $true)
    [Console]::OutputEncoding = New-Object Text.UTF8Encoding($false, $true)
    Add-Type -AssemblyName System.Security
    Add-Type -TypeDefinition @'
using System;
using System.IO;
using System.Text;
using System.Runtime.InteropServices;
using Microsoft.Win32.SafeHandles;
public static class XivVaultHandle {
    [StructLayout(LayoutKind.Sequential)] private struct Info {
        public uint Attributes;
        public System.Runtime.InteropServices.ComTypes.FILETIME Created, Accessed, Written;
        public uint Volume, SizeHigh, SizeLow, Links, IndexHigh, IndexLow;
    }
    [DllImport("kernel32.dll", SetLastError=true)] private static extern bool GetFileInformationByHandle(SafeFileHandle h, out Info i);
    [DllImport("kernel32.dll", CharSet=CharSet.Unicode, SetLastError=true)] private static extern uint GetFinalPathNameByHandle(SafeFileHandle h, StringBuilder b, uint n, uint flags);
    public static void Check(FileStream stream, string expected) {
        Info info;
        if (!GetFileInformationByHandle(stream.SafeFileHandle, out info) || info.Links != 1 || (info.Attributes & 1024) != 0) throw new IOException();
        var name = new StringBuilder(32768);
        uint count = GetFinalPathNameByHandle(stream.SafeFileHandle, name, (uint)name.Capacity, 0);
        if (count == 0 || count >= name.Capacity) throw new IOException();
        string actual = name.ToString();
        if (actual.StartsWith(@"\\?\")) actual = actual.Substring(4);
        if (!String.Equals(Path.GetFullPath(actual), expected, StringComparison.OrdinalIgnoreCase)) throw new IOException();
    }
}
'@
    $identity = [Security.Principal.WindowsIdentity]::GetCurrent()
    $sid = $identity.User
    $systemSid = New-Object Security.Principal.SecurityIdentifier('S-1-5-18')
    if ($null -eq $sid -or $identity.IsSystem -or -not $identity.IsAuthenticated) { throw 'vault' }

    function Private-Security([bool] $directory) {
        if ($directory) { $acl = New-Object Security.AccessControl.DirectorySecurity }
        else { $acl = New-Object Security.AccessControl.FileSecurity }
        $acl.SetOwner($sid)
        $acl.SetAccessRuleProtection($true, $false)
        $inherit = [Security.AccessControl.InheritanceFlags]::None
        if ($directory) { $inherit = [Security.AccessControl.InheritanceFlags]'ContainerInherit, ObjectInherit' }
        foreach ($principal in @($sid, $systemSid)) {
            $rule = New-Object Security.AccessControl.FileSystemAccessRule($principal, 'FullControl', $inherit, 'None', 'Allow')
            [void] $acl.AddAccessRule($rule)
        }
        return $acl
    }
    function Assert-PrivateAcl($acl, [bool] $directory) {
        if (-not $acl.AreAccessRulesProtected -or -not $acl.AreAccessRulesCanonical -or $acl.GetOwner([Security.Principal.SecurityIdentifier]).Value -cne $sid.Value) { throw 'vault' }
        $rules = @($acl.GetAccessRules($true, $true, [Security.Principal.SecurityIdentifier]))
        if ($rules.Count -ne 2) { throw 'vault' }
        $seen = @{}
        foreach ($rule in $rules) {
            $principal = $rule.IdentityReference.Value
            if (($principal -cne $sid.Value -and $principal -cne $systemSid.Value) -or $seen.ContainsKey($principal) -or $rule.IsInherited -or $rule.AccessControlType -ne 'Allow' -or $rule.FileSystemRights -ne 'FullControl' -or $rule.PropagationFlags -ne 'None') { throw 'vault' }
            $expected = [Security.AccessControl.InheritanceFlags]::None
            if ($directory) { $expected = [Security.AccessControl.InheritanceFlags]'ContainerInherit, ObjectInherit' }
            if ($rule.InheritanceFlags -ne $expected) { throw 'vault' }
            $seen[$principal] = $true
        }
    }
    function Assert-NoReparse([string] $value) {
        $cursor = [IO.Path]::GetFullPath($value)
        while ($cursor) {
            if (-not [IO.Directory]::Exists($cursor) -and -not [IO.File]::Exists($cursor)) { throw 'vault' }
            $attributes = [IO.File]::GetAttributes($cursor)
            if (($attributes -band [IO.FileAttributes]::ReparsePoint) -ne 0) { throw 'vault' }
            if (($attributes -band [IO.FileAttributes]::Directory) -ne 0) {
                $gitMarker = [IO.Path]::Combine($cursor, '.git')
                if ([IO.File]::Exists($gitMarker) -or [IO.Directory]::Exists($gitMarker)) { throw 'vault' }
            }
            $parent = [IO.Directory]::GetParent($cursor)
            if ($null -eq $parent) { break }
            $cursor = $parent.FullName
        }
    }
    function Assert-Base([string] $value, [bool] $syntheticTemp = $false) {
        if (-not [IO.Directory]::Exists($value) -or $value -notmatch '^[A-Za-z]:\\' -or $value.IndexOf(':', 2) -ge 0) { throw 'vault' }
        Assert-NoReparse $value
        $acl = [IO.Directory]::GetAccessControl($value)
        if ($acl.GetOwner([Security.Principal.SecurityIdentifier]).Value -cne $sid.Value) { throw 'vault' }
        # Only explicitly injected synthetic fixtures may use the shared Temp
        # parent. Their new vault tree still receives/validates the full private ACL.
        # Production LocalAppData never takes this exception.
        if ($syntheticTemp) { return }
        $writeMask = [Security.AccessControl.FileSystemRights]'Write, Delete, DeleteSubdirectoriesAndFiles, ChangePermissions, TakeOwnership'
        foreach ($rule in $acl.GetAccessRules($true, $true, [Security.Principal.SecurityIdentifier])) {
            $canWrite = ($rule.FileSystemRights -band $writeMask) -ne 0 -or ([int64] $rule.FileSystemRights -band 0x50000000) -ne 0
            if ($rule.AccessControlType -eq 'Allow' -and ($rule.PropagationFlags -band [Security.AccessControl.PropagationFlags]::InheritOnly) -eq 0 -and $canWrite -and $rule.IdentityReference.Value -notin @($sid.Value, $systemSid.Value, 'S-1-5-32-544')) { throw 'vault' }
        }
    }
    function Private-Directory([string] $value, [bool] $create) {
        if (-not [IO.Directory]::Exists($value)) {
            if (-not $create -or [IO.File]::Exists($value)) { throw 'vault' }
            $parent = [IO.Directory]::GetParent($value).FullName
            Assert-NoReparse $parent
            [void] [IO.Directory]::CreateDirectory($value, (Private-Security $true))
        }
        Assert-NoReparse $value
        Assert-PrivateAcl ([IO.Directory]::GetAccessControl($value)) $true
    }
    function Hash-Text([string] $value) {
        $sha = [Security.Cryptography.SHA256]::Create()
        try { return ([BitConverter]::ToString($sha.ComputeHash([Text.Encoding]::UTF8.GetBytes($value)))).Replace('-', '').ToLowerInvariant() }
        finally { $sha.Dispose() }
    }
    function Exact-Keys($value, [string[]] $keys) {
        if ($null -eq $value -or $value -isnot [PSCustomObject]) { throw 'vault' }
        $names = @($value.PSObject.Properties.Name)
        if ($names.Count -ne $keys.Count) { throw 'vault' }
        foreach ($key in $keys) { if ($names -cnotcontains $key) { throw 'vault' } }
    }

    $buffer = New-Object char[] 32769
    $count = [Console]::In.ReadBlock($buffer, 0, $buffer.Length)
    if ($count -eq 0 -or $count -gt 32768) { throw 'vault' }
    $request = (New-Object string($buffer, 0, $count)) | ConvertFrom-Json
    [Array]::Clear($buffer, 0, $buffer.Length)
    $names = @($request.PSObject.Properties.Name)
    $keys = @('operation', 'session')
    if ($names -ccontains 'testRoot') { $keys += 'testRoot' }
    if ($request.operation -ceq 'save') { $keys += 'credentials' }
    Exact-Keys $request $keys
    if ($request.operation -cnotin @('save', 'load') -or $request.session -isnot [string] -or $request.session -cnotmatch '\A(codex|claude):[A-Za-z0-9_-]{8,128}\z') { throw 'vault' }
    $create = $request.operation -ceq 'save'

    if ($names -ccontains 'testRoot') {
        if ($request.testRoot -isnot [string]) { throw 'vault' }
        $base = [IO.Path]::GetFullPath([IO.Path]::GetTempPath()).TrimEnd('\')
        Assert-Base $base $true
        $root = [IO.Path]::GetFullPath($request.testRoot)
        # GetFullPath also expands the Windows 8.3 Temp alias used by Node here.
        # Validate the resolved destination, then bind entropy to that canonical path.
        if ([IO.Path]::GetDirectoryName($root) -ine $base -or [IO.Path]::GetFileName($root) -cnotmatch '\Axiv-bridge-vault-test-[A-Za-z0-9_-]{8,100}\z') { throw 'vault' }
        Private-Directory $root $create
    } else {
        $base = [IO.Path]::GetFullPath([Environment]::GetFolderPath('LocalApplicationData')).TrimEnd('\')
        Assert-Base $base
        $container = [IO.Path]::Combine($base, 'XIV')
        Private-Directory $container $create
        $root = [IO.Path]::Combine($container, 'research-bridge')
        Private-Directory $root $create
    }
    $directory = [IO.Path]::Combine($root, (Hash-Text $request.session))
    Private-Directory $directory $create
    $file = [IO.Path]::Combine($directory, 'credential.dpapi')
    $entropy = [Text.Encoding]::UTF8.GetBytes("xiv-research-bridge-vault:v1`n" + $request.session + "`n" + $file.ToUpperInvariant())

    if ($create) {
        Exact-Keys $request.credentials @('projectUrl', 'publishableKey', 'ownerId', 'bridgeId', 'token', 'session', 'expiresAt')
        foreach ($property in $request.credentials.PSObject.Properties) {
            if ($property.Value -isnot [string] -or $property.Value.Length -gt 1024) { throw 'vault' }
        }
        if ($request.credentials.session -cne $request.session -or [IO.File]::Exists($file) -or [IO.Directory]::Exists($file)) { throw 'vault' }
        $plain = [Text.Encoding]::UTF8.GetBytes(($request.credentials | ConvertTo-Json -Compress))
        try { $cipher = [Security.Cryptography.ProtectedData]::Protect($plain, $entropy, [Security.Cryptography.DataProtectionScope]::CurrentUser) }
        finally { [Array]::Clear($plain, 0, $plain.Length) }
        $temporary = [IO.Path]::Combine($directory, ([Guid]::NewGuid().ToString('N') + '.tmp'))
        $temporaryOwned = $false
        try {
            $stream = New-Object IO.FileStream($temporary, [IO.FileMode]::CreateNew, [Security.AccessControl.FileSystemRights]::FullControl, [IO.FileShare]::None, 4096, [IO.FileOptions]::WriteThrough, (Private-Security $false))
            $temporaryOwned = $true
            try {
                [XivVaultHandle]::Check($stream, $temporary)
                Assert-PrivateAcl ($stream.GetAccessControl()) $false
                $stream.Write($cipher, 0, $cipher.Length)
                $stream.Flush($true)
            } finally { $stream.Dispose() }
            Assert-NoReparse $directory
            Assert-PrivateAcl ([IO.Directory]::GetAccessControl($directory)) $true
            [IO.File]::Move($temporary, $file)
            $temporary = $null
        } finally {
            if ($temporaryOwned -and $temporary -and [IO.File]::Exists($temporary)) { [IO.File]::Delete($temporary) }
            [Array]::Clear($cipher, 0, $cipher.Length)
        }
        [Console]::Out.Write('{"ok":true}')
    } else {
        Assert-NoReparse $file
        $stream = New-Object IO.FileStream($file, [IO.FileMode]::Open, [IO.FileAccess]::Read, [IO.FileShare]::None)
        try {
            [XivVaultHandle]::Check($stream, $file)
            Assert-PrivateAcl ($stream.GetAccessControl()) $false
            if ($stream.Length -lt 1 -or $stream.Length -gt 32768) { throw 'vault' }
            $cipher = New-Object byte[] ([int] $stream.Length)
            $read = 0
            while ($read -lt $cipher.Length) {
                $part = $stream.Read($cipher, $read, $cipher.Length - $read)
                if ($part -eq 0) { throw 'vault' }
                $read += $part
            }
            $plain = [Security.Cryptography.ProtectedData]::Unprotect($cipher, $entropy, [Security.Cryptography.DataProtectionScope]::CurrentUser)
            try { [Console]::Out.Write([Text.Encoding]::UTF8.GetString($plain)) }
            finally { [Array]::Clear($plain, 0, $plain.Length) }
        } finally {
            if ($null -ne $cipher) { [Array]::Clear($cipher, 0, $cipher.Length) }
            $stream.Dispose()
        }
    }
    exit 0
} catch {
    # Child diagnostics are never emitted: they may include a decrypted input value.
    exit 1
}
