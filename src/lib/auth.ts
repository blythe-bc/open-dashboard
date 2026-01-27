import { headers } from "next/headers";

export type AuthContext = {
  adUser: string;
  adGroups: string[];
};

const groupSeparators = /[;,]/;

export function getAuthContext(): AuthContext | null {
  const requestHeaders = headers();
  const adUser = requestHeaders.get("x-auth-user")?.trim();
  const groupHeader = requestHeaders.get("x-auth-groups")?.trim();

  if (!adUser || !groupHeader) {
    return null;
  }

  const adGroups = groupHeader
    .split(groupSeparators)
    .map((group) => group.trim())
    .filter(Boolean);

  return {
    adUser,
    adGroups
  };
}
