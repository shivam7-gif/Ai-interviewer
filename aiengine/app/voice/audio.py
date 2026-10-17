import struct

import numpy as np
import sounddevice as sd


def wav_to_pcm(wav: bytes) -> tuple[np.ndarray, int]:
    """Parse a WAV leniently (handles streaming-style headers with bogus sizes)."""
    if wav[:4] != b"RIFF" or wav[8:12] != b"WAVE":
        raise ValueError("not a WAV file")

    channels, rate, bits = 1, 48000, 16
    pos = 12
    while pos + 8 <= len(wav):
        chunk_id = wav[pos : pos + 4]
        size = struct.unpack("<I", wav[pos + 4 : pos + 8])[0]
        body = pos + 8

        if chunk_id == b"fmt ":
            _fmt, channels, rate, _byte_rate, _align, bits = struct.unpack(
                "<HHIIHH", wav[body : body + 16]
            )
        elif chunk_id == b"data":
            end = body + size
            if size == 0 or size == 0xFFFFFFFF or end > len(wav):
                end = len(wav)  # size field is a placeholder: use everything that follows
            if bits != 16:
                raise ValueError(f"only 16-bit WAV supported, got {bits}-bit")
            data = wav[body:end]
            data = data[: len(data) - len(data) % (2 * channels)]
            return np.frombuffer(data, dtype="<i2").reshape(-1, channels), rate

        pos = body + size + (size & 1)

    raise ValueError("no data chunk found in WAV")


def play_wav(wav: bytes) -> None:
    pcm, rate = wav_to_pcm(wav)
    sd.play(pcm, rate)
    sd.wait()