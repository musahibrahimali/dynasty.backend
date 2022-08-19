/*
* ########################################################################
* ############################# IMPORTS ##################################
* ########################################################################
* */
import bcrypt from 'bcrypt';

/*
* ########################################################################
* ################# HASH THE PASSWORD FOR SAFETY #########################
* ########################################################################
* */
export const hashPassword = async (password: string, salt: string): Promise<string> => {
    return await bcrypt.hash(password, salt);
};

/*
* ########################################################################
* ################# COMPARE PASSWORD WITH BCRYPT #########################
* ########################################################################
* */
export const comparePassword = async (password: string, hashedPassword: string): Promise<boolean> => {
    return await bcrypt.compare(password, hashedPassword);
};

/*
* ########################################################################
* ######################## GENERATE SALT #################################
* ########################################################################
* */
export const generateSalt = async (): Promise<string> => {
    return await bcrypt.genSalt(10);
};

/*
* ########################################################################
* ################# GENERATE A RANDOM 6 DIGIT NUMBER ######################
* ########################################################################
* */
export const generateRandomNumber = (): string => {
    return Math.floor(Math.random() * 1000000).toString();
}

/*
* ########################################################################
* ################# GENERATE A UNIQUE KEY FOR RESET ######################
* ########################################################################
* */
export const generateToken = async (): Promise<string> => {
    return generateRandomNumber();
}

/*
* ########################################################################
* ################# SEND EMAIL WITH THE NEW KEY ##########################
* ########################################################################
* */
export const sendEmail = (email: string, key: string): boolean => {
    console.log(email, key);
    return false;
}


