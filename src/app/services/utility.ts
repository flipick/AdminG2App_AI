export function getValidationErrors(response: any): string {
 if (response.isValidationError && response.error) {
    return Object.values(response.error)
      .flat()   // flattens nested arrays
      .join("\n");
  }
  return "";
}

interface User {
  userId: string;
  name: string;
  roleName: string;
  loginName: string;
  roleId: number;
  tenantId: string;
}

export function getRoleName(): string {
  const userData = localStorage.getItem("userClaimData");

  if (!userData) {
    return "";
  }

  try {
    const user: User = JSON.parse(userData);
    return user.roleName || "";
  } catch (error) {
    console.error("Error parsing user data:", error);
    return "";
  }
}

export function getUserName(): string {
  const userData = localStorage.getItem("userClaimData");

  if (!userData) {
    return "";
  }

  try {
    const user: User = JSON.parse(userData);
    return user.name || "";
  } catch (error) {
    console.error("Error parsing user data:", error);
    return "";
  }
}

export function getUserId(): string {
  const userData = localStorage.getItem("userClaimData"); 
  if (!userData) {
    return "";
  } 
  try {
    const user: User = JSON.parse(userData);
    return user.userId || "";
  } catch (error) {
    console.error("Error parsing user data:", error);
    return "";
  } 
}

export function getTenantId(): string {   
  const userData = localStorage.getItem("userClaimData");

  if (!userData) {
    return "";
  }
  try {
    const user: User = JSON.parse(userData);
    return user.tenantId || "";
  }
  catch (error) {
    console.error("Error parsing user data:", error);
    return "";
  }
}     


