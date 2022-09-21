import { Request, Response } from "express";
import { GAdmin } from '@admin/models/admin.model';
import { GUser } from "@users/models/user.model";

type Ctx = {
    req: Request & {User?: Pick<GUser | GAdmin, '_id' | 'email' | 'firstName' | 'lastName' | 'displayName'>};
    res: Response;
};

export default Ctx;
