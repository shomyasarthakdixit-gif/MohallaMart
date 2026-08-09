export declare class AuthService {
    verifyAndLogin(idToken: string, requestedRole?: string): Promise<{
        user: {
            id: string;
            phone: string;
            role: import("database").$Enums.Role;
        };
        accessToken: string;
    }>;
}
//# sourceMappingURL=auth.service.d.ts.map