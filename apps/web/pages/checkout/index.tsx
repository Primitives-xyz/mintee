import { NextPage } from "next";
import CheckoutForm from "../../components/CheckoutForm";

const DonatePage: NextPage = () => {
  return (
    <div className="page-container">
      <h1>Purchase Subscription</h1>
      <CheckoutForm />
    </div>
  );
};

export default DonatePage;
