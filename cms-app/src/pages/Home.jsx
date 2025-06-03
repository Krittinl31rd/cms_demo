import Button from "../components/ui/Button";
import { NavLink } from "react-router-dom";

const Home = () => {
  return (
    <div className="p-4 flex items-center justify-center">
      <Button>
        <NavLink to={"/technician"}>Technician</NavLink>
      </Button>
    </div>
  );
};

export default Home;
