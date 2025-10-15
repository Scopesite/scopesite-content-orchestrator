// Placeholder mapping. Replace with real lookup or DB.
// Map generic channel slugs to ContentStudio account IDs per workspace.
export function mapChannelsToAccounts(workspaceId: string, channels: string[]): string[] {
  // TODO: Replace with workspace-aware mapping.
  // For now we assume incoming channels are already account IDs or slugs recognised by ContentStudio.
  return channels;
}
