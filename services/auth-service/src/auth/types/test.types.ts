export interface ModuleImport {
  module?: { name?: string };
}

export function isModuleImport(value: unknown): value is ModuleImport {
  return typeof value === 'object' && value !== null && 'module' in value;
}

export interface GraphQLTestResponse {
  body: {
    data?: {
      ping?: string;
      register?: {
        accessToken: string;
        userId: string;
        roles: string[];
      };
      login?: {
        accessToken: string;
        userId: string;
        roles: string[];
      };
    };
    errors?: { message: string }[];
  };
}
