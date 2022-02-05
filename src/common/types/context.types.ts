import { Request, Response } from "express";
import { GUser } from 'src/users/models/user.model';

type Ctx = {
    req: Request & {User?: Pick<GUser, '_id' | 'email' | 'firstName' | 'lastName' | 'displayName'>};
    res: Response;
};

export default Ctx;
