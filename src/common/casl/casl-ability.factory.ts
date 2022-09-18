import { Injectable } from "@nestjs/common";
import {
    AbilityBuilder,
    AbilityClass, Ability,
    ExtractSubjectType,
    InferSubjects
} from '@casl/ability';
import {User} from "../../user";
import {Admin} from "../../admin";
import {Action} from "../enums";


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
            can(Action.Create, User);
            can(Action.Update, User);
            can(Action.Delete, User);
            cannot(Action.Manage, Admin);
        }
        return build({
            detectSubjectType: item => item.constructor as ExtractSubjectType<Subjects>
        });
    }
}
