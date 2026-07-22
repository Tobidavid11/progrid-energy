import itel from "../../assets/trusted1.svg";
import qasa from "../../assets/trusted2.svg";
import moniepoint from "../../assets/trusted3.svg";
import paypal from "../../assets/trusted4.svg";
import microsoft from "../../assets/trusted5.svg";
import slack from "../../assets/trusted6.svg";
import "./TrustedBy.css";

const LOGOS = [
  { name: "itel", src: itel },
  { name: "QASA", src: qasa },
  { name: "Moniepoint", src: moniepoint },
  { name: "PayPal", src: paypal },
  { name: "Microsoft", src: microsoft },
  { name: "Slack", src: slack },
];

export default function TrustedBy() {
  return (
    <section className="trusted-by">
      <div className="container">
        <p className="trusted-by__label">Trusted Products From Industry-Leading Brands</p>
      </div>

      <div className="trusted-by__marquee">
        <div className="trusted-by__track">
          {[...LOGOS, ...LOGOS].map((logo, i) => (
            <div className="trusted-by__item" key={`${logo.name}-${i}`}>
              <img src={logo.src} alt={logo.name} className="trusted-by__logo" />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}