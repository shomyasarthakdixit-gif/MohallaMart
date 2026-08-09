import { Request, Response } from "express";
import { AuthService } from "./auth.service";

export class AuthController {
  private authService: AuthService;

  constructor() {
    this.authService = new AuthService();
  }

  async verifyPhone(req: Request, res: Response): Promise<void> {
    try {
      const { idToken, role } = req.body;
      
      if (!idToken) {
        res.status(400).json({ error: "idToken is required" });
        return;
      }

      const result = await this.authService.verifyAndLogin(idToken, role);
      res.status(200).json(result);
    } catch (error: any) {
      console.error("Auth error:", error);
      res.status(401).json({ error: error.message || "Authentication failed" });
    }
  }
}
