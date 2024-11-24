declare namespace Express {
  export interface Request {
    auth?: Auth;
    token?: string;
  }
}

type Auth = {
  id: string;
  email: string;
  name: string;
  username: string;
};
