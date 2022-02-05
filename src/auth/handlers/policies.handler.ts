import { Action } from 'src/enums/actions.enum';
import { AppAbility } from 'src/casl/casl-ability.factory';
import { IPolicyHandler } from 'src/interface/interface';

export class ReadTrollPolicyHandler implements IPolicyHandler {
    handle(ability: AppAbility) {
        return ability.can(Action.Read, "all");
    }
}

