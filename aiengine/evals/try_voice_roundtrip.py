import asyncio
import time
from pathlib import Path

from app.voice.stt import transcribe
from app.voice.tts import synthesize

TEXT = "Hi, I'm Shilpa. Can you walk me through how the agents in StackPilot talk to each other?"


async def main():
    t0 = time.perf_counter()
    wav = await synthesize(TEXT)
    t1 = time.perf_counter()
    Path("tts_test.wav").write_bytes(wav)
    print(f"TTS: {len(wav) / 1024:.0f} KB in {(t1 - t0) * 1000:.0f} ms -> tts_test.wav")

    heard = await transcribe(wav)
    t2 = time.perf_counter()
    print(f"STT: {(t2 - t1) * 1000:.0f} ms")
    print(f"Original: {TEXT}")
    print(f"Heard:    {heard}")


asyncio.run(main())