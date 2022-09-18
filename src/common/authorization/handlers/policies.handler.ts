import {IPolicyHandler} from "../../interface";
import {AppAbility} from "../../casl";
import {Action} from "../../enums";
import {User} from "../../../user";
import {Admin} from "../../../admin";


export class ReadUserPolicyHandler implements IPolicyHandler {
    handle(ability: AppAbility) {
        return ability.can(Action.Read, User);
    }
}

// read admin policy handler
export class ReadAdminPolicyHandler implements IPolicyHandler {
    handle(ability: AppAbility) {
        return ability.can(Action.Read, Admin);
    }
}

// manage user policy handler
export class ManageUserPolicyHandler implements IPolicyHandler {
    handle(ability: AppAbility) {
        return ability.can(Action.Manage, User);
    }
}
