/**
 * Utility to classify a Docker bind-address value as local (loopback) or not.
 */

/**
 * Determine whether a bind-address value (as set via MCP_BIND_ADDRESS) refers
 * to a loopback interface — i.e. one that is not reachable from outside the
 * host it's running on.
 *
 * Accepts:
 *  - unset/empty (treated as "not opted in", so it's safe)
 *  - `127.0.0.0/8` in either bracketed or unbracketed form
 *  - `::1`, bracketed as `[::1]` or not (Docker Compose's `host_ip` accepts both)
 *  - IPv4-mapped loopback, e.g. `::ffff:127.0.0.1`
 *
 * Deliberately does NOT special-case `localhost`: Docker Compose rejects it
 * outright as an invalid `host_ip` before the container ever starts, so
 * accepting it here would just invite unverifiable hostname assumptions.
 *
 * Everything else — including `0.0.0.0`, `::`, and any LAN/public address —
 * is treated as non-local (fails closed).
 *
 * @param value The raw MCP_BIND_ADDRESS value.
 * @returns true if the value is a loopback address (or unset).
 */
export function isLocalBindAddress(value: string | undefined): boolean {
  const normalized = (value ?? '').trim();

  if (normalized === '') {
    return true;
  }

  // Compose's host_ip accepts IPv6 literals bracketed (e.g. "[::1]") or bare.
  const unbracketed = normalized.startsWith('[') && normalized.endsWith(']')
    ? normalized.slice(1, -1)
    : normalized;

  if (unbracketed === '::1') {
    return true;
  }

  const ipv4MappedMatch = unbracketed.match(/^::ffff:(\d{1,3}(?:\.\d{1,3}){3})$/i);
  const ipv4Candidate = ipv4MappedMatch ? ipv4MappedMatch[1] : unbracketed;

  const ipv4Match = ipv4Candidate.match(/^(\d{1,3})\.\d{1,3}\.\d{1,3}\.\d{1,3}$/);
  if (ipv4Match) {
    const firstOctet = parseInt(ipv4Match[1], 10);
    return firstOctet === 127;
  }

  return false;
}
