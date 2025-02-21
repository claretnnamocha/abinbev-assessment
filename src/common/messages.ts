export const LOGIN_CREDENTIALS_INVALID = 'email or password is not correct';

export const USER_WITH_EMAIL_EXIST = 'a user with this email already exists';

export const PASSWORD_RESET_LINK_EXPIRED = 'password reset link has expired';

export const REGISTRATION_SUCCESS = 'account created successfully';

export const LOGIN_SUCCESS = 'login successful';

export const LOGIN_FAILURE = 'login failed';

export const RECORD_NOT_FOUND = (recordName: string) =>
  `${recordName} does not exists`;
