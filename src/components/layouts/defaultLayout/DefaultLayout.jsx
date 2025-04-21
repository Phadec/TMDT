import { Header } from "../elements";

function DefaultLayout({ children }) {
  return (
    <div className="">
      <Header />
      <div>{children}</div>
    </div>
  );
}

export default DefaultLayout;
