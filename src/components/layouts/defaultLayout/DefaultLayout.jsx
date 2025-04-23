import { Header } from "../elements";

function DefaultLayout({ children }) {
  return (
    <div>
      <Header />
      <div>{children}</div>
    </div>
  );
}

export default DefaultLayout;
