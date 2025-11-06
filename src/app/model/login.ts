
export interface ILoginRequest {
  username: string,
  password: string
}

export interface TokenResponse {
  userId: string;
//  role: string;
  accessToken: string;
  refreshToken: string;
  userClaimData: {
    userId: string;
    name: string;
    loginName: string;
    roleId: number;
    roleName: string;
  };
}


export interface UserClaimData {
  userId: number;
  name: string;
  loginName: string;
  roleId: string;
  roleName: string;
}




