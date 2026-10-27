import subprocess
import sys
import os
import time

def stop_process(name, proc):
    if proc.poll() is not None:
        print(f" [+] Already stopped {name}")
        return

    if os.name == "nt":
        # On Windows, taskkill /F /T kills the entire process tree (e.g. cmd -> node, python -> uvicorn worker)
        try:
            subprocess.run(
                ["taskkill", "/F", "/T", "/PID", str(proc.pid)],
                stdout=subprocess.DEVNULL,
                stderr=subprocess.DEVNULL,
                check=False
            )
        except Exception:
            pass

    try:
        proc.terminate()
        proc.wait(timeout=2)
    except Exception:
        try:
            proc.kill()
        except Exception:
            pass

    print(f" [+] Stopped {name}")

def main():
    if hasattr(sys.stdout, 'reconfigure'):
        try:
            sys.stdout.reconfigure(encoding='utf-8')
        except Exception:
            pass

    root_dir = os.path.dirname(os.path.abspath(__file__))
    backend_dir = os.path.join(root_dir, "backend")
    frontend_dir = os.path.join(root_dir, "frontend")

    print("=" * 60)
    print(" [*] Starting COD Tournament Web Application")
    print("=" * 60)
    print(" [-] Backend API:  http://127.0.0.1:8000")
    print(" [-] API Docs:     http://127.0.0.1:8000/docs")
    print(" [-] Frontend UI:  http://127.0.0.1:3000 (Vite)")
    print("=" * 60)
    print(" Press Ctrl+C to stop both servers.\n")

    processes = []

    try:
        # Start Backend (FastAPI uvicorn server)
        backend_cmd = [
            sys.executable, "-m", "uvicorn", "main:codapp",
            "--reload",
            "--host", "127.0.0.1",
            "--port", "8000"
        ]
        backend_proc = subprocess.Popen(backend_cmd, cwd=backend_dir)
        processes.append(("Backend (FastAPI)", backend_proc))

        # Start Frontend using Vite dev server
        npx_cmd = "npx.cmd" if os.name == "nt" else "npx"
        try:
            frontend_cmd = [npx_cmd, "vite", "--port", "3000", "--host"]
            frontend_proc = subprocess.Popen(frontend_cmd, cwd=frontend_dir, stdin=subprocess.DEVNULL)
        except Exception:
            # Fallback to python http server if npx/vite is not present
            frontend_cmd = [sys.executable, "-m", "http.server", "3000", "--directory", frontend_dir]
            frontend_proc = subprocess.Popen(frontend_cmd, cwd=root_dir)

        processes.append(("Frontend (Vite Dev Server)", frontend_proc))

        # Keep main process alive and monitor sub-processes
        while True:
            time.sleep(1)
            for name, proc in processes:
                if proc.poll() is not None:
                    print(f"\n[!] {name} terminated unexpectedly with exit code {proc.returncode}")
                    raise KeyboardInterrupt

    except KeyboardInterrupt:
        print("\n[*] Shutting down servers...")
        for name, proc in processes:
            stop_process(name, proc)
        print("[+] Both servers stopped successfully.")
        sys.exit(0)

if __name__ == "__main__":
    main()
