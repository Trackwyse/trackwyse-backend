| Method | Endpoint                       | Description                                                        | Request Body (opt.)                              | Response                    | Authorization Header | Refresh Cookie |
|--------|--------------------------------|--------------------------------------------------------------------|--------------------------------------------------|-----------------------------|----------------------|----------------|
| POST   | /auth/v1/login                 | Allows users to authenticate and log in to the system.             | username, password                               | error, message, accessToken | false                | false          |
| POST   | /auth/v1/register              | Allows users to create a new account in the system.                | username, firstName, lastName, password          | error, message, accessToken | false                | false          |
| POST   | /auth/v1/verify                | Verify the email for an account                                    | verificationToken                                | error, message              | true                 | false          |
| POST   | /auth/v1/forgot                | Allows users to receive a reset link in their email.               | email                                            | error, message              | false                | false          |
| POST   | /auth/v1/reset                 | Allows users to reset their password, from the link in their email | email, password, resetToken                      | error, message, accessToken | false                | false          |
| POST   | /auth/v1/refresh               | Refreshes the accessToken for a user.                              | none                                             | error, message, accessToken | false                | true           |
| POST   | /auth/v1/logout                | Logs a user out, removing the refresh token                        | none                                             | error, message              | true                 | false          |
| GET    | /auth/v1/me                    | Get the currently logged in user                                   | none                                             | error, message, user        | true                 | false          |
| POST   | /auth/v1/checkEmail            | Check if an email has an account associated with it                | email                                            | error, message, emailInUse  | false                | false          |
| POST   | /auth/v1/acceptTerms           | Agree to the terms and conditions for a user                       | none                                             | error, message              | true                 | false          |
|        |                                |                                                                    |                                                  |                             |                      |                |
| GET    | /api/v1/labels                 | Fetches all labels that a user owns                                | none                                             | error, message, labels      | true                 | false          |
| POST   | /api/v1/labels/add/:labelId    | Adds a label to a users account                                    | none                                             | error, message              | true                 | false          |
| PATCH  | /api/v1/labels/modify/:labelId | Modifies a label on a users account                                | labelName, labelColor, labelMessage, phoneNumber | error, message              | true                 | false          |
| DELETE | /api/v1/labels/delete/:labelId | Deletes a label from a users account                               | none                                             | error, message              | true                 | false          |
