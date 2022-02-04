import { Actions, Permissions } from 'nest-casl';
import { InferSubjects } from '@casl/ability';
import { Roles } from 'src/common/common';
import { GAdmin } from 'src/admin/models/admin.model';
import { GUser } from 'src/users/models/user.model';

export type Subjects = InferSubjects<typeof GAdmin | typeof GUser>;

export const permissions: Permissions<Roles, Subjects, Actions> = {
  everyone({ can }) {
    can(Actions.read, GAdmin);
    can(Actions.create, GAdmin);
  },

  admin({ user, can }) {
    can(Actions.manage, GAdmin);
    can(Actions.manage, GUser);
    can(Actions.update, GAdmin, { _id: user.id });
  },
};