import { Actions, Permissions } from 'nest-casl';
import { InferSubjects } from '@casl/ability';
import { Roles } from 'src/common/common';
import { GAdmin } from 'src/admin/models/admin.model';
import { GProduct } from 'src/products/models/product.model';

export type Subjects = InferSubjects<typeof GAdmin>;

export const permissions: Permissions<Roles, Subjects, Actions> = {
  everyone({ can }) {
    can(Actions.read, GAdmin);
  },

  admin({ can }) {
    can(Actions.manage, GProduct);
  },
};