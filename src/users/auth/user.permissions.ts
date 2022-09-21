import { Actions, Permissions } from 'nest-casl';
import { InferSubjects } from '@casl/ability';
import { GUser } from 'src/users/models/user.model';
import { Roles } from '@common';
import { GAdmin } from 'src/admin/models/admin.model';

export type Subjects = InferSubjects<typeof GUser | typeof GAdmin>;

export const permissions: Permissions<Roles, Subjects, Actions> = {
  everyone({ can }) {
    can(Actions.read, GUser);
    can(Actions.create, GUser);
  },

  admin({ can }) {
    can(Actions.manage, GUser);
  },

  user({ user, can }) {
    can(Actions.read, GUser, { _id: user.id });
    can(Actions.update, GUser, { _id: user.id });
    can(Actions.delete, GUser, { _id: user.id });
  },

};