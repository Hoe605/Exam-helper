@echo off
echo Starting Local LLM Server...
"D:\Development\llama-b8661-bin-win-cuda-12.4-x64\llama-server.exe" -m "D:\Code\llm\gemma-4-gguf\llm\gemma.gguf" -ngl 99 --flash-attn on -c 2048
pause
