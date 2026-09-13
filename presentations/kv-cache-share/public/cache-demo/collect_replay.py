#!/usr/bin/env python3
"""Measure DeepSeek V4 Flash time-to-first-token for a stable vs changed prefix.

Run this file directly. It uses only Python's standard library and never writes
the API key to disk.
"""

import getpass
import json
import secrets
import statistics
import time
import urllib.error
import urllib.request
from typing import Callable, Iterable, Mapping, Optional


BASE_URL = "https://api.deepseek.com/chat/completions"
MODEL = "deepseek-v4-flash"
USER_PROMPT = "只回复：收到。"
WARMUP_REQUESTS = 2
SAMPLE_REQUESTS = 5
CACHE_BUILD_WAIT_SECONDS = 3
# About 96K input tokens with the current reference text; large enough to make
# the prefill work visible in TTFT while remaining far below the model limit.
REFERENCE_REPEATS = 6_000


def build_system_prompt(marker: str) -> str:
    """Return an intentionally long prompt whose only variable part is marker."""
    stable_rule = (
        "你是一个演示助手。请始终使用简洁中文回答，遵循给定任务，"
        "不要解释这段系统资料本身。"
    )
    # The repeated reference material is deliberately stable so a provider can
    # recognize the common prefix across independent requests.
    reference = "参考资料：稳定前缀应逐字保持一致；变化内容应放在请求末尾。"
    return f"{marker}\n{stable_rule}\n" + (reference + "\n") * REFERENCE_REPEATS


def event_text_delta(event: Mapping[str, object]) -> str:
    """Extract the Chat Completions text delta, ignoring empty SSE events."""
    choices = event.get("choices")
    if not isinstance(choices, list) or not choices:
        return ""
    first_choice = choices[0]
    if not isinstance(first_choice, dict):
        return ""
    delta = first_choice.get("delta")
    if not isinstance(delta, dict):
        return ""
    content = delta.get("content")
    return content if isinstance(content, str) else ""


def extract_cache_usage(event: Mapping[str, object]) -> Optional[tuple[int, int, int]]:
    """Return (prompt, cache-hit, cache-miss) tokens from a stream usage event."""
    usage = event.get("usage")
    if not isinstance(usage, dict):
        return None
    values = (
        usage.get("prompt_tokens"),
        usage.get("prompt_cache_hit_tokens"),
        usage.get("prompt_cache_miss_tokens"),
    )
    if not all(isinstance(value, int) for value in values):
        return None
    return values  # type: ignore[return-value]


def fresh_miss_markers(
    count: int, *, nonce: Callable[[int], str] = secrets.token_hex
) -> list[str]:
    """Make every sample differ from its first token and from prior program runs."""
    return [f"{nonce(12)}-cache-miss" for _ in range(count)]


def measure_ttft_from_events(
    events: Iterable[Mapping[str, object]],
    *,
    started_at: float,
    now: Callable[[], float] = time.perf_counter,
) -> Optional[float]:
    """Return milliseconds until the first non-empty answer delta, if any."""
    for event in events:
        if event_text_delta(event):
            return round((now() - started_at) * 1000, 1)
    return None


def stream_events(api_key: str, system_prompt: str) -> Iterable[Mapping[str, object]]:
    payload = {
        "model": MODEL,
        "messages": [
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": USER_PROMPT},
        ],
        "thinking": {"type": "disabled"},
        "max_tokens": 16,
        "stream": True,
        "stream_options": {"include_usage": True},
    }
    request = urllib.request.Request(
        BASE_URL,
        data=json.dumps(payload).encode("utf-8"),
        headers={
            "Authorization": f"Bearer {api_key}",
            "Content-Type": "application/json",
            "Accept": "text/event-stream",
        },
        method="POST",
    )
    with urllib.request.urlopen(request, timeout=120) as response:
        for raw_line in response:
            line = raw_line.decode("utf-8").strip()
            if not line.startswith("data:"):
                continue
            data = line[5:].strip()
            if data == "[DONE]":
                return
            try:
                event = json.loads(data)
            except json.JSONDecodeError:
                continue
            if isinstance(event, dict):
                yield event


def run_case(label: str, api_key: str, marker: str) -> tuple[Optional[float], Optional[tuple[int, int, int]]]:
    started_at = time.perf_counter()
    ttft_ms = None
    cache_usage = None
    for event in stream_events(api_key, build_system_prompt(marker)):
        if ttft_ms is None and event_text_delta(event):
            ttft_ms = round((time.perf_counter() - started_at) * 1000, 1)
        observed_usage = extract_cache_usage(event)
        if observed_usage is not None:
            cache_usage = observed_usage

    if ttft_ms is None:
        print(f"{label}: 未收到文本 token")
    else:
        print(f"{label}: TTFT {ttft_ms:.1f} ms", end="")
        if cache_usage is None:
            print("；未收到缓存 usage")
        else:
            prompt, hit, miss = cache_usage
            print(f"；缓存命中 {hit}/{prompt} tokens，未命中 {miss}")
    return ttft_ms, cache_usage


def run_group(label: str, api_key: str, markers: list[str]) -> None:
    results = [run_case(f"{label} #{index}", api_key, marker) for index, marker in enumerate(markers, 1)]
    ttfts = [ttft for ttft, _ in results if ttft is not None]
    usages = [usage for _, usage in results if usage is not None]
    if ttfts:
        print(f"{label} 中位 TTFT：{statistics.median(ttfts):.1f} ms")
    if usages:
        prompt_tokens = sum(usage[0] for usage in usages)
        hit_tokens = sum(usage[1] for usage in usages)
        miss_tokens = sum(usage[2] for usage in usages)
        print(
            f"{label} 缓存汇总：命中 {hit_tokens}/{prompt_tokens} tokens "
            f"({hit_tokens / prompt_tokens:.1%})，未命中 {miss_tokens}"
        )



def collect_replay():
    import argparse
    import datetime
    from pathlib import Path
    parser = argparse.ArgumentParser(description="采集真实实验结果，供 Slidev 离线回放")
    parser.add_argument("--output", default="results.json")
    args = parser.parse_args()
    api_key = getpass.getpass("DeepSeek API Key（仅内存，不写入结果）: ").strip()
    if not api_key:
        raise SystemExit("未输入密钥，未发起请求。")
    print("将发送 2 次预热 + 10 次测量请求；会产生 API 费用。运行时长取决于网络和服务负载。")
    run_id = secrets.token_hex(12)
    stable_marker = run_id + "-stable"
    samples = []
    def collect(group, number, marker):
        label = f"{group} #{number}"
        row = {"group": group, "sample": number, "ttft_ms": None,
               "prompt_tokens": None, "hit_tokens": None, "miss_tokens": None}
        try:
            ttft, usage = run_case(label, api_key, marker)
            row["ttft_ms"] = ttft
            if usage:
                row.update(zip(("prompt_tokens", "hit_tokens", "miss_tokens"), usage))
            if ttft is None or usage is None:
                row["error"] = "missing_text_or_usage"
        except urllib.error.HTTPError as error:
            row["error"] = f"http_{error.code}"
        except (urllib.error.URLError, TimeoutError, OSError):
            row["error"] = "network_error"
        samples.append(row)
    for n in range(1, 3):
        collect("warmup", n, stable_marker)
    time.sleep(CACHE_BUILD_WAIT_SECONDS)
    # 交替运行两组，并逐对交换顺序，减少固定先后顺序的影响。
    for n in range(1, 6):
        order = ("stable", "changed") if n % 2 else ("changed", "stable")
        for group in order:
            marker = stable_marker if group == "stable" else secrets.token_hex(12) + "-changed"
            collect(group, n, marker)
    result = {
        "schema_version": 1, "kind": "measured",
        "recorded_at": datetime.datetime.now(datetime.timezone.utc).isoformat(),
        "model": MODEL,
        "method": "2 warmups; 5 paired samples; alternating group order; first nonempty content delta",
        "reference_repeats": REFERENCE_REPEATS, "thinking": "disabled", "max_tokens": 16,
        "samples": samples,
    }
    dest = Path(args.output)
    dest.parent.mkdir(parents=True, exist_ok=True)
    dest.write_text(json.dumps(result, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(f"已保存 {dest.resolve()}（不含密钥、提示词正文、模型回答）")
    if any(r.get("error") for r in samples):
        print("有失败或数据缺失样本，结果保留原始失败标记；回放不会把它们算成 0。")

if __name__ == "__main__":
    collect_replay()
