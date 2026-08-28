import subprocess

cmd = [
    "impacket-wmiexec",
    "-codec", "utf-8",
    "lopes.local/Administrator@10.1.1.169",
    "chcp 65001 & wmic computersystem get name,manufacturer,model,username /format:list"
]

r = subprocess.run(cmd, capture_output=True, timeout=25)

print("=== STDOUT BYTES ===")
print(repr(r.stdout))
print("\n=== STDERR BYTES ===")
print(repr(r.stderr))