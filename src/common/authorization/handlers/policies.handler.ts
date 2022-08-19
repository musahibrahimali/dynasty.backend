import {IPolicyHandler} from "@common/interface/casl.interface";
import {AppAbility} from "@common/casl/casl-ability.factory";
import {Action} from "@common/common";
import {User} from "@user/schema/user.schema";
import {Admin} from "@admin/schema/admin.schema";


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
