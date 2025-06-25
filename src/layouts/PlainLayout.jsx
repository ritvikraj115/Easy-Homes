import { Outlet } from "react-router-dom";

const PlainLayout = () => {
  return (
    <main>
      <Outlet />
    </main>
  );
};

export default PlainLayout;
