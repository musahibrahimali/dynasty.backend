import { Actions, Permissions } from 'nest-casl';
import { InferSubjects } from '@casl/ability';
import { Roles } from '@common';
import { GAdmin } from 'src/admin/models/admin.model';
import { GProduct } from 'src/products/models/product.model';
import { GUser } from 'src/users/models/user.model';

export type Subjects = InferSubjects<typeof GAdmin | typeof GUser>;

export const permissions: Permissions<Roles, Subjects, Actions> = {
  everyone({ can }) {
    can(Actions.read, GProduct);
  },

  admin({ can }) {
    can(Actions.manage, GProduct);
  },

  user({ can }) {
    can(Actions.read, GProduct);
  },
};