import { Injectable } from "@nestjs/common";
import { Action } from 'src/enums/enums';
import { 
    AbilityBuilder, 
    AbilityClass, 
    Ability, 
    ExtractSubjectType, 
    InferSubjects 
} from '@casl/ability';
import { Admin } from 'src/admin/schema/admin.schema';
import { User } from 'src/user/schema/user.schema';

type Subjects = InferSubjects<typeof User | typeof Admin> | 'all';

export type AppAbility = Ability<[Action, Subjects]>;

@Injectable()
export class CaslAbilityFactory {
    createForUser(user: User | Admin) {
        const { can, cannot, build } = new AbilityBuilder<Ability<[Action, Subjects]>>(
            Ability as AbilityClass<AppAbility>
        );

        if (user.isAdmin) {
            can(Action.Manage, 'all');
            can(Action.Manage, Admin);
            can(Action.Manage, User);
        } else {
            can(Action.Read, 'all');
            cannot(Action.Manage, Admin);
        }
        return build({
            detectSubjectType: item => item.constructor as ExtractSubjectType<Subjects>
        });
    }
}
