export type UserID = string;
type TokenType = 'Bearer';
type Role = string;
type AllowedOrigins = string[];
type ResourceAccess = {
  [x: string]: {
    roles: Role[];
  };
};
type Scope = 'openid profile email';

export type KeycloakAuthUser = {
  exp: Date;
  iat: Date;
  jti: string;
  iss: URL;
  aud: Role[];
  sub: UserID;
  typ: TokenType;
  azp: string;
  sid: string;
  acr: string;
  'allowed-origins': AllowedOrigins;
  realm_access: {
    roles: Role[];
  };
  resource_access: ResourceAccess;
  scope: Scope;
  email_verified: boolean;
  name: string;
  preferred_username: string;
  given_name: string;
  family_name: string;
  email: string;
};
