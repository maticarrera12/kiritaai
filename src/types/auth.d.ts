// Extend better-auth types with custom fields
declare module "better-auth" {
  export interface User {
    plan?: string;
    credits?: number;
  }
}

export {};
