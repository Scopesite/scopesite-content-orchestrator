// Map generic channel slugs to ContentStudio account IDs per workspace.
// Reads from ACCOUNT_MAP_JSON env var: { "ws_123": { "linkedin": "acc_111", "instagram": ["acc_222", "acc_333"] } }
// If no mapping is found, falls back to identity (returns channels as-is).

type AccountMap = Record<string, Record<string, string | string[]>>;

let accountMap: AccountMap = {};

try {
  const raw = process.env.ACCOUNT_MAP_JSON;
  if (raw) {
    accountMap = JSON.parse(raw);
  }
} catch (e) {
  console.warn("Failed to parse ACCOUNT_MAP_JSON:", e);
}

export function mapChannelsToAccounts(workspaceId: string, channels: string[]): string[] {
  const workspaceMap = accountMap[workspaceId];
  if (!workspaceMap) {
    // No mapping for this workspace, return channels as-is
    return channels;
  }

  const result: string[] = [];
  for (const channel of channels) {
    const mapped = workspaceMap[channel];
    if (mapped !== undefined) {
      // Mapping found
      if (Array.isArray(mapped)) {
        result.push(...mapped);
      } else {
        result.push(mapped);
      }
    } else {
      // No mapping for this channel, use identity fallback
      result.push(channel);
    }
  }

  return result;
}
