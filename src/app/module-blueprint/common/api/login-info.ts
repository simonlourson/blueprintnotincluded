export class LoginInfo
{
    public registration: boolean;
    public email: string;
    public username: string;
    public password: string;
    public confirmPassword: string;

    public constructor()
    {
        this.registration = false;
    }
}