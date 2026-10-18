def build_context(
    resume: str | None = None,
    github: str | None = None,
    codeforce: str | None = None,
) -> str:
    parts = []

    if resume:
        parts.append("Resume fetched:\n" + resume)
    if github:
        parts.append("Github profile fetched:\n" + github)
    if codeforce:
        parts.append("Codeforces profile fetched:\n" + codeforce)
    if not parts:
        raise ValueError("At least one source is required.")
    return "\n\n".join(parts)
