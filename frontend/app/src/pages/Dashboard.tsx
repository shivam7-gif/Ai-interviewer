
import { Profile } from "../components/Profile";
import {Toaster} from "sonner";
import {Form} from "../components/Form";
export const Dashboard = () => {
  return (
    <div>
      <h1>hello from dashboard page</h1>
      <div className="testing">
        <Profile />
      </div>
      <Toaster/>
      <Form/>
    </div>
  );
};
