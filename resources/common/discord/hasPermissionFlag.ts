export function hasPermissionFlag(
  permissions: string,
  requiredPermissions: bigint,
): boolean {
  const result = BigInt(permissions) & requiredPermissions;
  return result === requiredPermissions;
}
